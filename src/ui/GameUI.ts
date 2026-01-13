import { DialogueBox } from './DialogueBox';
import { ChoiceMenu, type ChoiceOption } from './ChoiceMenu';
import { IntroScreen } from './IntroScreen';
import { ReflectionPromptOverlay } from './ReflectionPrompt';
import { CharacterRenderer } from './CharacterRenderer';
import { ChatOverlay } from './ChatOverlay';
import { vi } from '../i18n/vi';
import type { ChatMessage } from '../types/game';

export class GameUI {
  private root: HTMLElement;
  private dialogueBox: DialogueBox;
  private choiceMenu: ChoiceMenu;
  private introScreen: IntroScreen;
  private reflectionPrompt: ReflectionPromptOverlay;
  private characterRenderer: CharacterRenderer;
  private chatOverlay: ChatOverlay;
  private timelineElement: HTMLElement;
  private variablesPanel: HTMLElement;
  private menuButton: HTMLElement;
  private menuOverlay: HTMLElement;
  // Ẩn chỉ số mặc định, chỉ bật khi có trigger/toggle
  private showStats = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.setupHTML();
    this.dialogueBox = new DialogueBox(this.root.querySelector('#dialogue-container')!);
    this.choiceMenu = new ChoiceMenu(this.root.querySelector('#choice-container')!);
    this.introScreen = new IntroScreen(this.root.querySelector('#intro-container')!);
    this.reflectionPrompt = new ReflectionPromptOverlay(this.root.querySelector('#reflection-container')!);
    this.characterRenderer = new CharacterRenderer(this.root.querySelector('#character-layer')!);
    this.chatOverlay = new ChatOverlay(this.root.querySelector('#chat-overlay')!);
    this.timelineElement = this.root.querySelector('#timeline') as HTMLElement;
    this.variablesPanel = this.root.querySelector('#variables-panel') as HTMLElement;
    this.menuButton = this.root.querySelector('#menu-button') as HTMLElement;
    this.menuOverlay = this.root.querySelector('#menu-overlay') as HTMLElement;

    // Ẩn chỉ số lúc khởi động
    this.variablesPanel.style.display = 'none';

    this.setupMenu();
  }

  private setupHTML(): void {
    this.root.innerHTML = `
      <div id="game-container">
        <div id="background-layer"></div>
        <div id="character-layer"></div>
        
        <div id="ui-overlay">
          <div id="timeline"></div>
          <div id="variables-panel"></div>
        </div>

        <div id="chat-overlay"></div>

        <div id="dialogue-container"></div>
        <div id="choice-container"></div>
        <div id="intro-container" style="display: none;"></div>
        <div id="reflection-container" style="display: none;"></div>

        <div id="menu-overlay" class="hidden">
          <div class="menu-content">
            <h2>Menu</h2>
            <button id="save-btn">Lưu</button>
            <button id="load-btn">Tải</button>
            <button id="settings-btn">Cài đặt</button>
            <button id="log-btn">Nhật ký thoại</button>
            <button id="story-map-btn">Sơ đồ truyện</button>
            <button id="close-menu-btn">Đóng</button>
          </div>
        </div>
      </div>
    `;
  }

  private setupMenu(): void {
    // Menu button đã bị ẩn, chỉ setup nếu tồn tại
    if (this.menuButton) {
      this.menuButton.addEventListener('click', () => {
        this.menuOverlay.classList.toggle('hidden');
      });
    }

    this.root.querySelector('#close-menu-btn')?.addEventListener('click', () => {
      if (this.menuOverlay) {
        this.menuOverlay.classList.add('hidden');
      }
    });
  }

  async showDialogue(speaker: string | null, text: string, tags?: string[], character?: string): Promise<void> {
    this.choiceMenu.hide();
    
    // Hiển thị character nếu có
    if (character) {
      // Xác định vị trí dựa trên speaker
      let position: 'left' | 'center' | 'right' = 'center';
      if (speaker === 'Minh') {
        position = 'left';
      } else if (speaker && speaker !== 'Minh') {
        position = 'right';
      }
      this.characterRenderer.showCharacter(character, position);
    }
    
    await this.dialogueBox.show(speaker, text, tags);
  }

  showChatMessage(message: ChatMessage): void {
    this.chatOverlay.addMessage(message);
  }

  clearChatOverlay(): void {
    this.chatOverlay.clear();
  }

  setUiState(key: string, value: boolean | string | number): void {
    if (key === 'showStats') {
      this.setStatsVisible(value === true);
    }
    // Có thể mở rộng thêm các UI state khác sau
  }

  setCharacters(characters: Array<{ character: string; position?: 'left' | 'center' | 'right'; visible?: boolean }>): void {
    this.characterRenderer.setCharacters(characters);
  }

  clearCharacters(): void {
    this.characterRenderer.clearAll();
  }

  showChoices(prompt: string, options: ChoiceOption[], onSelect: (id: string) => void): void {
    this.choiceMenu.show(prompt, options, onSelect);
  }

  hideChoices(): void {
    this.choiceMenu.hide();
  }

  updateTimeline(day: number, dayTitle: string, sceneTitle?: string): void {
    const header = `Day ${day} — ${dayTitle}`;
    this.timelineElement.textContent =
      sceneTitle && sceneTitle !== dayTitle ? `${header} · ${sceneTitle}` : header;
  }

  updateVariables(variables: Record<string, number>): void {
    const vars = Object.entries(variables)
      .map(([key, value]) => {
        const label = vi.variables[key as keyof typeof vi.variables] || key;
        return `<div class="var-item"><span class="var-name">${label}</span><span class="var-value">${value}</span></div>`;
      })
      .join('');
    this.variablesPanel.innerHTML = vars;
    this.variablesPanel.style.display = this.showStats ? 'flex' : 'none';
  }

  setStatsVisible(visible: boolean): void {
    this.showStats = visible;
    this.variablesPanel.style.display = visible ? 'flex' : 'none';
  }

  toggleStatsVisible(): void {
    this.setStatsVisible(!this.showStats);
  }

  setBackground(bgId: string): void {
    const bgLayer = this.root.querySelector('#background-layer') as HTMLElement;
    // Hỗ trợ cả background và CG (CG có thể ở cả bg và cg folder)
    let bgUrl = `/assets/bg/${bgId}.png`;
    
    // Nếu là CG (bắt đầu bằng cg_), thử load từ cả hai folder
    if (bgId.startsWith('cg_')) {
      bgUrl = `/assets/bg/${bgId}.png`; // CG có thể ở trong bg folder
    }
    
    bgLayer.style.backgroundImage = `url(${bgUrl})`;
    bgLayer.style.backgroundSize = 'cover';
    bgLayer.style.backgroundPosition = 'center';
    bgLayer.style.backgroundColor = '#1a1a2e'; // Fallback color
    
    // Check if image loads, if not use gradient
    const img = new Image();
    img.onerror = () => {
      // Nếu là CG và không tìm thấy trong bg, thử cg folder
      if (bgId.startsWith('cg_')) {
        const cgUrl = `/assets/cg/${bgId}.png`;
        const cgImg = new Image();
        cgImg.onload = () => {
          bgLayer.style.backgroundImage = `url(${cgUrl})`;
        };
        cgImg.onerror = () => {
          bgLayer.style.backgroundImage = `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`;
        };
        cgImg.src = cgUrl;
      } else {
        bgLayer.style.backgroundImage = `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`;
      }
    };
    img.src = bgUrl;
  }

  setCG(cgId: string): void {
    // CG có thể hiển thị như background hoặc overlay
    // Hiện tại dùng setBackground để hỗ trợ CG
    this.setBackground(cgId);
  }

  onMenuAction(action: string, callback: () => void): void {
    const btn = this.root.querySelector(`#${action}-btn`);
    if (btn) {
      btn.addEventListener('click', callback);
    }
  }

  showToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.root.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  getIntroScreen(): IntroScreen {
    return this.introScreen;
  }

  getReflectionPrompt(): ReflectionPromptOverlay {
    return this.reflectionPrompt;
  }

  showCelebrationDialog(message: string): Promise<void> {
    return new Promise((resolve) => {
      // Tạo overlay
      const overlay = document.createElement('div');
      overlay.className = 'celebration-overlay';
      overlay.innerHTML = `
        <div class="celebration-dialog">
          <div class="celebration-icon">✨</div>
          <h2 class="celebration-title">Chúc mừng!</h2>
          <p class="celebration-message">${message}</p>
          <button class="celebration-button">Tiếp tục</button>
        </div>
      `;

      this.root.appendChild(overlay);

      // Animation fade in
      setTimeout(() => {
        overlay.classList.add('show');
      }, 10);

      // Button click handler
      const button = overlay.querySelector('.celebration-button');
      button?.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 300);
      });
    });
  }
}
