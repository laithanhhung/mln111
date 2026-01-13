export class CharacterRenderer {
  private container: HTMLElement;
  private currentCharacters: Map<string, HTMLElement> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  showCharacter(characterId: string, position: 'left' | 'center' | 'right' = 'center'): void {
    // Nếu đã có, chỉ cập nhật position
    if (this.currentCharacters.has(characterId)) {
      const element = this.currentCharacters.get(characterId)!;
      this.updatePosition(element, position);
      element.style.display = 'block';
      return;
    }

    // Tạo element mới
    const characterElement = document.createElement('div');
    characterElement.className = 'character-sprite';
    characterElement.dataset.characterId = characterId;
    
    const img = document.createElement('img');
    img.src = `/assets/characters/${characterId}.png`;
    img.alt = characterId;
    img.onerror = () => {
      console.warn(`Character sprite not found: ${characterId}`);
      characterElement.style.display = 'none';
    };

    characterElement.appendChild(img);
    this.updatePosition(characterElement, position);
    this.container.appendChild(characterElement);
    this.currentCharacters.set(characterId, characterElement);

    // Fade in animation
    characterElement.style.opacity = '0';
    setTimeout(() => {
      characterElement.style.transition = 'opacity 0.3s';
      characterElement.style.opacity = '1';
    }, 10);
  }

  hideCharacter(characterId: string): void {
    const element = this.currentCharacters.get(characterId);
    if (element) {
      element.style.transition = 'opacity 0.3s';
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.display = 'none';
      }, 300);
    }
  }

  updateCharacter(characterId: string, newCharacterId: string, position?: 'left' | 'center' | 'right'): void {
    const element = this.currentCharacters.get(characterId);
    if (element) {
      const img = element.querySelector('img') as HTMLImageElement;
      if (img) {
        img.src = `/assets/characters/${newCharacterId}.png`;
        img.alt = newCharacterId;
        element.dataset.characterId = newCharacterId;
        this.currentCharacters.delete(characterId);
        this.currentCharacters.set(newCharacterId, element);
      }
      if (position) {
        this.updatePosition(element, position);
      }
    }
  }

  clearAll(): void {
    this.currentCharacters.forEach((element) => {
      element.style.transition = 'opacity 0.3s';
      element.style.opacity = '0';
    });
    setTimeout(() => {
      this.container.innerHTML = '';
      this.currentCharacters.clear();
    }, 300);
  }

  setCharacters(characters: Array<{ character: string; position?: 'left' | 'center' | 'right'; visible?: boolean }>): void {
    // Ẩn tất cả characters hiện tại
    const currentIds = new Set(this.currentCharacters.keys());
    const newIds = new Set(characters.filter(c => c.visible !== false).map(c => c.character));

    // Ẩn characters không còn trong danh sách
    currentIds.forEach((id) => {
      if (!newIds.has(id)) {
        this.hideCharacter(id);
      }
    });

    // Hiển thị characters mới
    characters.forEach((char) => {
      if (char.visible !== false) {
        this.showCharacter(char.character, char.position || 'center');
      }
    });
  }

  private updatePosition(element: HTMLElement, position: 'left' | 'center' | 'right'): void {
    element.className = `character-sprite character-${position}`;
  }
}
