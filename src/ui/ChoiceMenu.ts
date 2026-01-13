export interface ChoiceOption {
  id: string;
  text: string;
  subtext?: string; // Giải thích điều người chơi sẽ đánh đổi
  percentage?: number;
}

export class ChoiceMenu {
  private container: HTMLElement;
  private onSelect?: (optionId: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  show(prompt: string, options: ChoiceOption[], onSelect: (optionId: string) => void): void {
    this.onSelect = onSelect;
    this.container.innerHTML = `
      <div class="choice-menu">
        <div class="choice-prompt">${prompt}</div>
        <div class="choice-options">
          ${options
            .map(
              (opt, idx) => `
            <button class="choice-option" data-id="${opt.id}">
              <span class="choice-label">${String.fromCharCode(65 + idx)}</span>
              <div class="choice-text-wrapper">
                <span class="choice-text">${opt.text}</span>
                ${opt.subtext ? `<span class="choice-subtext">${opt.subtext}</span>` : ''}
              </div>
              ${opt.percentage !== undefined ? `<span class="choice-percentage">${opt.percentage}%</span>` : ''}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.container.style.display = 'block';

    // Attach event listeners
    this.container.querySelectorAll('.choice-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const optionId = (btn as HTMLElement).dataset.id;
        if (optionId && this.onSelect) {
          this.onSelect(optionId);
        }
      });
    });
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }
}
