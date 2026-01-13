import type { ReflectionPrompt } from '../types/game';

export class ReflectionPromptOverlay {
  private container: HTMLElement;
  private onContinue?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  show(prompt: ReflectionPrompt, onContinue: () => void): void {
    this.onContinue = onContinue;

    const questionsHTML = prompt.questions
      .map((q) => `<div class="reflection-question">${q}</div>`)
      .join('');

    this.container.innerHTML = `
      <div class="reflection-overlay">
        <div class="reflection-content">
          <div class="reflection-header">
            <h2>Dừng lại 10 giây</h2>
          </div>
          <div class="reflection-summary">
            ${prompt.summary}
          </div>
          <div class="reflection-questions">
            ${questionsHTML}
          </div>
          <button id="reflection-continue-btn" class="reflection-btn">Tiếp tục</button>
        </div>
      </div>
    `;

    this.container.style.display = 'block';

    const continueBtn = this.container.querySelector('#reflection-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.onContinue) this.onContinue();
      });
    }
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }
}
