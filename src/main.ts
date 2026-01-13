import './ui/styles.css';
import { GameEngine } from './core/GameEngine';
import { GameUI } from './ui/GameUI';
import { SceneLoader } from './content/SceneLoader';
import { SaveManager } from './storage/SaveManager';
import { AudioManager } from './audio/AudioManager';
import type { ChoiceOption } from './ui/ChoiceMenu';
import { vi } from './i18n/vi';

class Game {
  private engine: GameEngine;
  private ui: GameUI;
  private audio: AudioManager;
  private isPaused: boolean = false;

  constructor() {
    const root = document.getElementById('app')!;
    this.ui = new GameUI(root);
    this.engine = new GameEngine();
    this.audio = new AudioManager();

    this.setupEventListeners();
    this.setupMenuHandlers();
  }

  private setupEventListeners(): void {
    // Line event
    this.engine.on('line', async (event) => {
      if (event.type === 'line') {
        const lineAny = event.line as any;
        const tags = lineAny.tags || [];
        const character = lineAny.character;
        const lineType = lineAny.type || 'dialogue';

        if (lineType === 'chat') {
          // Chat overlay cho Lumen / group
          const sceneId = this.engine.getStateManager().getCurrentScene();
          const vars = this.engine.getStateManager().getVariables();

          let mode: 'warm' | 'neutral' | 'ominous' = 'neutral';
          if (sceneId === 'S01' || sceneId === 'S09') {
            mode = 'ominous';
          } else if (vars.TrustAI >= 70) {
            mode = 'warm';
          } else if (vars.TrustAI < 40) {
            mode = 'neutral';
          }

          this.ui.showChatMessage({
            id: `${sceneId}_${lineAny.lineIndex ?? 0}`,
            sender: (lineAny.channel === 'lumen' ? 'LUMEN' : 'GROUP') as any,
            text: event.line.text,
            avatarAlias: lineAny.avatarAlias || 'ch_lumen_avatar',
            mode,
          });
          
          // Chat message không cần chờ, nhưng cần delay nhỏ để UI render
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          // Thoại thường trong khung VN
          await this.ui.showDialogue(event.line.speaker, event.line.text, tags, character);
        }
      }
    });

    // Choice event
    this.engine.on('choice', (event) => {
      if (event.type === 'choice') {
        const options: ChoiceOption[] = event.options.map((opt: any) => {
          const percentage = this.engine.getStateManager().getChoicePercentage(opt.id);
          return {
            id: opt.id,
            text: opt.text,
            subtext: opt.subtext,
            percentage: percentage > 0 ? percentage : undefined,
          };
        });

        const prompt = (event as any).prompt || event.choiceId;

        this.ui.showChoices(prompt, options, (optionId) => {
          // Hide choice menu ngay khi chọn
          this.ui.hideChoices();
          
          // Check for reflection prompts before selecting
          // Tìm option trong event.options (đã được filter bởi getAvailableOptions)
          const selectedOption = event.options.find((opt: any) => opt.id === optionId);
          if (selectedOption?.reflectionPrompts) {
            this.ui.getReflectionPrompt().show(selectedOption.reflectionPrompts, () => {
              this.ui.getReflectionPrompt().hide();
              this.engine.selectChoice(optionId);
            });
          } else {
            this.engine.selectChoice(optionId);
          }
        });
      }
    });

    // Scene change event
    this.engine.on('sceneChange', async (event) => {
      if (event.type === 'sceneChange') {
        console.log('Scene change event:', event.sceneId);
        // Đảm bảo scene được load vào SceneManager
        const scene = await SceneLoader.loadScene(event.sceneId);
        this.engine.getSceneManager().loadScene(scene);
        await this.loadScene(event.sceneId);
      }
    });

    // Effect event
    this.engine.on('effect', (event) => {
      if (event.type === 'effect') {
        try {
          const action = JSON.parse(event.effect);
          this.handleAction(action);
        } catch {
          // Not JSON, just a string effect type
        }
      }
    });

    // Game complete event (S16 kết thúc)
    this.engine.on('gameComplete', () => {
      this.showCharacterEvaluation();
    });

    // Ending event - không dùng nữa, S16 sẽ được xử lý như scene bình thường
    // this.engine.on('ending', (event) => {
    //   if (event.type === 'ending') {
    //     this.showEnding(event.ending);
    //   }
    // });

    // Click để advance dialogue: chỉ nút \"Tiếp tục\" mới sang dòng tiếp
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.choice-option') || target.closest('.menu-content')) {
        // Đã có handler riêng cho choice/menu
        return;
      }

      // Chỉ khi bấm vào nút Tiếp tục trong khung thoại
      if (target.closest('.dialogue-next-btn')) {
        if (!this.isPaused) {
          this.engine.processNext();
        }
      }
    });
  }

  private async loadScene(sceneId: string): Promise<void> {
    const scene = await SceneLoader.loadScene(sceneId);
    
    // Hide choice menu khi load scene mới
    this.ui.hideChoices();
    
    // Set background hoặc CG
    if (scene.background) {
      this.ui.setBackground(scene.background);
    }
    // CG có thể override background nếu có
    if (scene.cg) {
      this.ui.setCG(scene.cg);
    }
    
    if (scene.music) {
      this.audio.playBgm(scene.music);
    }

    // Update timeline (ưu tiên dayNumber/dayTitle, fallback từ title)
    const parsed = scene.title.match(/Day (\d+)\s*[—-]\s*(.*)/);
    const fallbackDay = parsed ? parseInt(parsed[1]) : 1;
    const fallbackTitle = parsed ? parsed[2] : scene.title;

    const dayNumber = scene.dayNumber ?? fallbackDay;
    const dayTitle = scene.dayTitle ?? fallbackTitle;
    // sceneTitle có thể là title nếu không có sceneTitle riêng
    const sceneTitle = scene.sceneTitle || (scene.title !== `${fallbackTitle}` ? scene.title : undefined);

    this.ui.updateTimeline(dayNumber, dayTitle, sceneTitle);

    // Clear chat overlay khi load scene mới (trừ khi scene có chat_overlay trong ui)
    if (!scene.ui || !scene.ui.includes('chat_overlay')) {
      this.ui.clearChatOverlay();
    }

    // Set characters for scene (xử lý empty array)
    if (scene.characters && scene.characters.length > 0) {
      this.ui.setCharacters(scene.characters);
    } else {
      // Clear characters nếu không có hoặc là empty array
      this.ui.clearCharacters();
    }

    // Update variables display
    const vars = this.engine.getStateManager().getVariables();
    this.ui.updateVariables(vars as unknown as Record<string, number>);

    // Nếu là S16, show ending trước khi process lines
    if (sceneId === 'S16') {
      const ending = this.engine.getStateManager().getEnding();
      const endingTexts = {
        A: 'Kết thúc A — Minh chọn cách trốn vào ảo/thoát ly thay vì đối diện thực tại.',
        B: 'Kết thúc B — Minh đã trả giá cho những đường tắt/ảo tưởng nhưng vẫn còn cơ hội sửa sai.',
        C: 'Kết thúc C — Minh bắt đầu sống biện chứng: nhìn thẳng vào thực tế và dám làm những việc nhỏ nhưng thật.',
        D: 'Kết thúc D — Minh biết dùng AI như công cụ, kết nối với người thật và chủ động cải biến điều kiện sống.',
      };
      
      // Show ending text, sau đó show evaluation, rồi mới process lines
      await this.ui.showDialogue(null, endingTexts[ending]);
      const evaluation = this.buildFinalEvaluation();
      await this.ui.showDialogue(null, evaluation);
      // Sau khi show ending, process lines của S16 sẽ tiếp tục
    }
  }

  private handleAction(action: any): void {
    switch (action.type) {
      case 'playBgm':
        if (action.id) {
          this.audio.playBgm(action.id, action.loop !== false);
        }
        break;
      case 'stopBgm':
        this.audio.stopBgm(action.fadeOutMs || 0);
        break;
      case 'playSfx':
        if (action.id) {
          this.audio.playSfx(action.id, action.volume);
        }
        break;
      case 'toast':
        if (action.message) this.ui.showToast(action.message);
        break;
      case 'setUiState':
        if (action.key && action.value !== undefined) {
          this.ui.setUiState(action.key, action.value);
        }
        break;
      case 'delay':
        // Delay được xử lý trong executeOnEnterActions
        break;
    }
  }

  private setupMenuHandlers(): void {
    this.ui.onMenuAction('save', () => {
      const state = this.engine.getStateManager().export();
      const slotId = 0; // For now, use slot 0
      if (SaveManager.save(slotId, state)) {
        this.ui.showToast(vi.messages.gameSaved);
      } else {
        this.ui.showToast(vi.messages.saveFailed);
      }
    });

    this.ui.onMenuAction('load', () => {
      const slotId = 0;
      const savedState = SaveManager.load(slotId);
      if (savedState) {
        this.engine.getStateManager().import(savedState);
        this.loadScene(savedState.sceneId);
        this.engine.processScene();
        this.ui.showToast(vi.messages.gameLoaded);
      } else {
        this.ui.showToast(vi.messages.noSaveFound);
      }
    });

    this.ui.onMenuAction('settings', () => {
      this.ui.toggleStatsVisible();
      this.ui.showToast('Đã chuyển trạng thái hiển thị chỉ số.');
    });

    this.ui.onMenuAction('log', () => {
      const history = this.engine.getStateManager().getState().history;
      console.log('Nhật ký thoại:', history);
      this.ui.showToast(vi.messages.logEntries(history.length));
    });

    this.ui.onMenuAction('story-map', () => {
      this.ui.showToast(vi.messages.comingSoon);
    });
  }

  // Method này không được sử dụng nữa vì ending được xử lý trong loadScene() khi load S16
  // private showEnding(ending: 'A' | 'B' | 'C' | 'D'): void {
  //   const endingTexts = {
  //     A: 'Kết thúc A — Minh chọn cách trốn vào ảo/thoát ly thay vì đối diện thực tại.',
  //     B: 'Kết thúc B — Minh đã trả giá cho những đường tắt/ảo tưởng nhưng vẫn còn cơ hội sửa sai.',
  //     C: 'Kết thúc C — Minh bắt đầu sống biện chứng: nhìn thẳng vào thực tế và dám làm những việc nhỏ nhưng thật.',
  //     D: 'Kết thúc D — Minh biết dùng AI như công cụ, kết nối với người thật và chủ động cải biến điều kiện sống.',
  //   };
  //
  //   // 1) Thông báo ending dựa trên BC
  //   this.ui.showDialogue(null, endingTexts[ending]).then(() => {
  //     // 2) Đánh giá nhân vật dựa trên 5 chỉ số hiện tại
  //     const evaluation = this.buildFinalEvaluation();
  //     this.ui.showDialogue(null, evaluation);
  //     // Người chơi bấm \"Tiếp tục\" để sang epilogue (S16 lines)
  //   });
  // }

  private buildFinalEvaluation(): string {
    const vars = this.engine.getStateManager().getVariables();
    const parts: string[] = [];

    // BC – mức độ \"biện chứng\"
    if (vars.BC <= 25) {
      parts.push(
        'Biện Chứng (BC) thấp: Minh thường để cảm xúc cuốn đi, ít kiểm chứng lại bằng thực tiễn. ' +
          'Minh còn dễ chọn đường tắt hoặc trốn tránh khi gặp mâu thuẫn.',
      );
    } else if (vars.BC <= 50) {
      parts.push(
        'Biện Chứng (BC) trung bình: Minh đã bắt đầu nhận ra vai trò của điều kiện khách quan, ' +
          'nhưng đôi khi vẫn hành động theo cảm tính hoặc kỳ vọng chủ quan.',
      );
    } else if (vars.BC <= 75) {
      parts.push(
        'Biện Chứng (BC) khá: Minh biết nhìn vào điều kiện thực tế và thử nghiệm lại bằng hành động nhỏ, ' +
          'dù vẫn còn những lúc dao động.',
      );
    } else {
      parts.push(
        'Biện Chứng (BC) cao: Minh có thói quen xuất phát từ hoàn cảnh cụ thể, rồi chủ động hành động để kiểm chứng và điều chỉnh.',
      );
    }

    // RealityAnchor – bám thực tại
    if (vars.RealityAnchor <= 30) {
      parts.push(
        'Neo Thực Tại thấp: Minh dễ bị cuốn vào màn hình, suy diễn và mất ngủ; cần thêm những hành động rất cụ thể ' +
          'như ngủ đủ, đi bộ, gặp người thật để kéo mình về hiện tại.',
      );
    } else if (vars.RealityAnchor >= 70) {
      parts.push(
        'Neo Thực Tại tốt: Minh biết dừng lại, ra ngoài, tiếp xúc với đời sống thật để kiểm chứng lại suy nghĩ của mình.',
      );
    }

    // TrustAI – quan hệ với AI
    if (vars.TrustAI >= 75) {
      parts.push(
        'Niềm tin vào AI cao: Minh dễ coi AI như nguồn đáp án chính. Để an toàn hơn, Minh cần giữ nguyên tắc: ' +
          'AI chỉ là công cụ gợi ý, quyết định cuối cùng phải qua thực tiễn và trách nhiệm của chính mình.',
      );
    } else if (vars.TrustAI <= 25) {
      parts.push(
        'Niềm tin vào AI thấp: Minh khá cảnh giác với AI, điều này giúp tránh lệ thuộc, ' +
          'nhưng nếu cực đoan có thể bỏ lỡ những hỗ trợ hữu ích từ công cụ.',
      );
    }

    // TrustFriends – quan hệ với người khác
    if (vars.TrustFriends >= 70) {
      parts.push(
        'Niềm tin vào bạn bè tốt: Minh dám nhờ giúp đỡ, lắng nghe và hợp tác. Đây là điều kiện xã hội quan trọng ' +
          'để không phải một mình gánh hết mọi thứ.',
      );
    } else if (vars.TrustFriends <= 30) {
      parts.push(
        'Niềm tin vào bạn bè thấp: Minh đang thu mình lại, dễ cảm thấy bị bỏ rơi. ' +
          'Có lẽ Minh cần một vài trải nghiệm nhỏ về việc được lắng nghe và bảo vệ để lấy lại niềm tin.',
      );
    }

    // SelfEsteem – tự trọng/tự tin
    if (vars.SelfEsteem >= 70) {
      parts.push(
        'Tự trọng khá vững: Minh biết công nhận nỗ lực của mình, không tự bào mòn quá mức khi thất bại.',
      );
    } else if (vars.SelfEsteem <= 30) {
      parts.push(
        'Tự trọng đang thấp: Minh hay quy hết lỗi cho bản thân, dễ tự kết luận \"mình vô dụng\". ' +
          'Một vài thành công nhỏ, có kiểm chứng, sẽ rất quan trọng để Minh hồi phục niềm tin vào chính mình.',
      );
    }

    return parts.join(' ');
  }

  private getCharacterType(): { type: string; message: string } {
    const vars = this.engine.getStateManager().getVariables();
    const BC = vars.BC;
    const RealityAnchor = vars.RealityAnchor;
    const TrustFriends = vars.TrustFriends;
    const TrustAI = vars.TrustAI;
    const SelfEsteem = vars.SelfEsteem;

    // Kiểm tra theo thứ tự ưu tiên (từ trên xuống)
    
    // 1) "Kiến tạo thực tại" (best)
    if (BC >= 75 && RealityAnchor >= 60 && TrustFriends >= 50) {
      return {
        type: 'Kiến tạo thực tại',
        message: 'Chúc mừng! Bạn là Người Kiến Tạo Thực Tại — hiểu đúng điều kiện và dám hành động để đổi nó.'
      };
    }

    // 2) "Nhà biện chứng" (đúng lý luận, khá thực tế)
    if (BC >= 70 && RealityAnchor >= 45) {
      return {
        type: 'Nhà biện chứng',
        message: 'Chúc mừng! Bạn là Nhà Biện Chứng — cân bằng lý trí và thực tiễn, không cực đoan.'
      };
    }

    // 3) "Người neo thực tại" (rất thực tế, ít mơ mộng)
    if (RealityAnchor >= 70 && BC < 70) {
      return {
        type: 'Người neo thực tại',
        message: 'Chúc mừng! Bạn là Người Neo Thực Tại — bạn tin vào \'làm thử\' hơn là \'nghĩ cho hay\'.'
      };
    }

    // 4) "Người kết nối" (tin người, xã hội giúp mình đứng vững)
    if (TrustFriends >= 70 && TrustAI < 60) {
      return {
        type: 'Người kết nối',
        message: 'Chúc mừng! Bạn là Người Kết Nối — bạn dùng con người và trải nghiệm thật để trưởng thành.'
      };
    }

    // 5) "Người bạn của Lumen" (tin AI nhưng vẫn ổn)
    if (TrustAI >= 75 && BC >= 50) {
      return {
        type: 'Người bạn của Lumen',
        message: 'Chúc mừng! Bạn là Người Bạn của Lumen — dùng AI như công cụ mạnh, nhưng vẫn giữ được hướng đi.'
      };
    }

    // 6) "Trú ẩn số" (tin AI cao, bám thực tại thấp)
    if (TrustAI >= 75 && TrustFriends < 45 && RealityAnchor < 45) {
      return {
        type: 'Trú ẩn số',
        message: 'Chúc mừng! Bạn là Kẻ Trú Ẩn Số — an toàn trong màn hình, và bước tiếp theo là kéo mình về đời thật.'
      };
    }

    // 7) "Đang tổn thương" (tự trọng thấp)
    if (SelfEsteem < 35) {
      return {
        type: 'Đang tổn thương',
        message: 'Chúc mừng! Bạn là Người Đang Hồi Phục — bạn đã đi qua tổn thương, giờ chỉ cần thêm một hành động thật nhỏ.'
      };
    }

    // 8) Mặc định (fallback)
    return {
      type: 'Đang tìm đường',
      message: 'Chúc mừng! Bạn là Người Đang Tìm Đường — mỗi lựa chọn của bạn đang dạy bạn hiểu mình rõ hơn.'
    };
  }

  private async showCharacterEvaluation(): Promise<void> {
    const characterType = this.getCharacterType();
    await this.ui.showCelebrationDialog(characterType.message);
  }

  async start(): Promise<void> {
    // Show intro screen first
    this.showIntroScreen();
  }

  private showIntroScreen(): void {
    this.ui.getIntroScreen().show(() => {
      // Start game after intro
      this.ui.getIntroScreen().hide();
      this.startGame();
    });
  }

  private async startGame(): Promise<void> {
    // Load all scenes
    const scenes = await SceneLoader.loadAllScenes();
    this.engine.loadScenes(scenes);

    // Load initial scene
    const currentSceneId = this.engine.getStateManager().getCurrentScene();
    await this.loadScene(currentSceneId);

    // Start the game
    this.engine.start();
  }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
  });
} else {
  const game = new Game();
  game.start();
}
