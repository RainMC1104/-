export const MODE_COMMANDS = {
  a: 'adventure',
  adventure: 'adventure',
  c: 'creative',
  creative: 'creative',
  s: 'survival',
  survival: 'survival',
  spectator: 'spectator'
};

const MODE_CHOICES = ['adventure', 'a', 'creative', 'c', 'spectator', 'survival', 's'];
const TARGET_CHOICES = ['@a', '@e', '@p', '@r', '@s'];
const AMOUNT_CHOICES = ['1', '16', '32', '64'];
const COMMANDS = ['/gamemode', '/give'];

export function getChatSuggestions(value, itemIds) {
  if (!value.startsWith('/')) return [];
  const tokens = value.split(' ');
  const command = tokens[0];
  if (tokens.length === 1) {
    const partial = command.toLowerCase();
    return COMMANDS.filter(candidate => candidate.startsWith(partial))
      .sort((a, b) => a.localeCompare(b))
      .map(label => ({ label, value: label }));
  }
  if (command === '/gamemode' && tokens.length === 2) {
    const partial = tokens[1].toLowerCase();
    return MODE_CHOICES.filter(choice => choice.startsWith(partial))
      .sort((a, b) => a.localeCompare(b))
      .map(label => ({ label, value: `/gamemode ${label}` }));
  }
  if (command === '/give' && tokens.length === 2) {
    const partial = tokens[1].toLowerCase();
    return TARGET_CHOICES.filter(choice => choice.startsWith(partial))
      .sort((a, b) => a.localeCompare(b))
      .map(label => ({ label, value: `/give ${label}` }));
  }
  if (command === '/give' && tokens.length === 3) {
    const partial = tokens[2].toLowerCase();
    return [...itemIds].filter(id => id.startsWith(partial))
      .sort((a, b) => a.localeCompare(b))
      .map(label => ({ label, value: `${tokens[0]} ${tokens[1]} ${label}` }));
  }
  if (command === '/give' && tokens.length === 4) {
    const partial = tokens[3].toLowerCase();
    return AMOUNT_CHOICES.filter(choice => choice.startsWith(partial))
      .sort((a, b) => a.localeCompare(b))
      .map(label => ({ label, value: `${tokens.slice(0, 3).join(' ')} ${label}` }));
  }
  return [];
}

export function attachChat({ input, log, suggestions, itemIds, onCommand, onMessage, onClose }) {
  let open = false;
  let currentSuggestions = [];
  let selectedSuggestion = 0;
  const renderSuggestions = () => {
    currentSuggestions = getChatSuggestions(input.value, itemIds);
    selectedSuggestion = Math.min(selectedSuggestion, Math.max(currentSuggestions.length - 1, 0));
    suggestions.replaceChildren();
    for (const [index, suggestion] of currentSuggestions.entries()) {
      const option = document.createElement('div');
      option.className = `chat-suggestion${index === selectedSuggestion ? ' selected' : ''}`;
      option.textContent = suggestion.label;
      suggestions.appendChild(option);
    }
    suggestions.hidden = currentSuggestions.length === 0;
  };
  const setOpen = value => {
    const wasOpen = open;
    open = value;
    document.querySelector('#chatPanel').classList.toggle('open', open);
    input.disabled = !open;
    if (open) {
      renderSuggestions();
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    } else {
      suggestions.hidden = true;
      input.blur();
      if (wasOpen) onClose();
    }
  };
  const appendMessage = (text, kind = '') => {
    const row = document.createElement('div');
    row.className = `chat-line${kind ? ` ${kind}` : ''}`;
    row.textContent = text;
    log.appendChild(row);
    while (log.children.length > 40) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  };
  input.addEventListener('input', () => {
    selectedSuggestion = 0;
    renderSuggestions();
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (!currentSuggestions.length) return;
      input.value = currentSuggestions[selectedSuggestion].value;
      selectedSuggestion = 0;
      renderSuggestions();
      return;
    }
    if (event.key === 'ArrowDown' && currentSuggestions.length) {
      event.preventDefault();
      selectedSuggestion = (selectedSuggestion + 1) % currentSuggestions.length;
      renderSuggestions();
      return;
    }
    if (event.key === 'ArrowUp' && currentSuggestions.length) {
      event.preventDefault();
      selectedSuggestion = (selectedSuggestion - 1 + currentSuggestions.length) % currentSuggestions.length;
      renderSuggestions();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      setOpen(false);
      return;
    }
    if (text.startsWith('/')) {
      const result = onCommand(text);
      if (result) appendMessage(result, 'system');
    } else {
      appendMessage(`プレイヤー: ${text}`, 'message');
      onMessage(text);
    }
    input.value = '';
    selectedSuggestion = 0;
    setOpen(false);
  });
  return {
    get isOpen() { return open; },
    open(initialValue = '') {
      input.value = initialValue;
      setOpen(true);
    },
    close() {
      setOpen(false);
    },
    systemMessage(text) {
      appendMessage(text, 'system');
    }
  };
}
