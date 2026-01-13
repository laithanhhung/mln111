export class DialogueBox {
  private container: HTMLElement;
  private speakerElement: HTMLElement;
  private textElement: HTMLElement;
  private isTyping: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.innerHTML = `
      <div class="dialogue-box">
        <div class="dialogue-speaker"></div>
        <div class="dialogue-text"></div>
        <div class="dialogue-footer">
          <button class="dialogue-next-btn">Tiếp tục ▷</button>
        </div>
      </div>
    `;

    this.speakerElement = this.container.querySelector('.dialogue-speaker')!;
    this.textElement = this.container.querySelector('.dialogue-text')!;
  }

  show(speaker: string | null, text: string, tags?: string[]): Promise<void> {
    return new Promise((resolve) => {
      this.speakerElement.textContent = speaker || '';
      this.textElement.textContent = '';

      // Apply tags
      if (tags?.includes('shake')) {
        this.textElement.classList.add('shake');
      } else {
        this.textElement.classList.remove('shake');
      }

      if (tags?.includes('blur')) {
        this.textElement.classList.add('blur');
      } else {
        this.textElement.classList.remove('blur');
      }

      if (tags?.includes('pause')) {
        this.textElement.classList.add('pause');
      } else {
        this.textElement.classList.remove('pause');
      }

      // Typewriter effect
      this.typeText(text, resolve);
    });
  }

  private typeText(text: string, onComplete: () => void): void {
    let index = 0;
    const speed = 30; // ms per character

    const type = () => {
      if (index < text.length) {
        this.textElement.textContent = text.substring(0, index + 1);
        index++;
        setTimeout(type, speed);
      } else {
        onComplete();
      }
    };

    this.isTyping = true;
    type();
  }

  skipTyping(): void {
    // This would need to be implemented with a flag to stop typing
    if (this.isTyping) {
      this.isTyping = false;
    }
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  showElement(): void {
    this.container.style.display = 'block';
  }
}
