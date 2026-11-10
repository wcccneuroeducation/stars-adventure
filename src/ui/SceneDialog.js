// Native modal provides focus trapping, touch buttons and Escape handling.
export class SceneDialog {
  constructor(scene, controls) {
    this.scene = scene;
    this.controls = controls;
    this.element = document.createElement('dialog');
    this.element.className = 'scenario-dialog';
    this.element.setAttribute('aria-labelledby', 'scenario-dialog-title');
    this.element.addEventListener('cancel', event => {
      if (this.required) event.preventDefault();
    });
    this.element.addEventListener('close', () => {
      this.controls.reset();
      this.scene.input.keyboard.enabled = true;
      this.scene.input.keyboard.addCapture(['W','A','S','D','UP','DOWN','LEFT','RIGHT','E','C']);
      document.querySelector('#game').focus({ preventScroll: true });
    });
    document.body.append(this.element);
    scene.events.once('shutdown', () => this.destroy());
  }
  get open() { return this.element.open; }
  show(title, message, actions, { required = false, content = null } = {}) {
    this.required = required;
    this.controls.reset();
    this.scene.player.setVelocity(0);
    this.scene.input.keyboard.enabled = false;
    // Let native selects use arrow keys instead of Phaser preventing defaults.
    this.scene.input.keyboard.removeCapture(['W','A','S','D','UP','DOWN','LEFT','RIGHT','E','C']);
    const heading = document.createElement('h2');
    heading.id = 'scenario-dialog-title'; heading.textContent = title;
    const body = document.createElement('p'); body.textContent = message;
    const buttons = document.createElement('div'); buttons.className = 'dialog-actions';
    actions.forEach(({ label, run, disabled = false }) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label;
      button.disabled = disabled;
      button.addEventListener('click', run);
      buttons.append(button);
    });
    this.element.replaceChildren(heading, body);
    if (content) this.element.append(content);
    this.element.append(buttons);
    if (!this.open) this.element.showModal();
    // Explicit focus also handles the second page of an already-open call.
    (content?.querySelector('select') || buttons.querySelector('button:not(:disabled)')).focus();
  }
  close() { this.element.close(); }
  destroy() {
    this.controls.reset();
    this.scene.input.keyboard.enabled = true;
    this.element.remove();
  }
}
