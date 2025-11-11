import { t } from './i18n.js';

export function createStatCard({ title, amount, type = '' }) {
    const card = document.createElement('div');
    card.className = 'stat-card';

    const titleEl = document.createElement('h3');
    titleEl.dataset.i18n = title;
    titleEl.textContent = t(title);

    const amountEl = document.createElement('p');
    amountEl.className = `amount ${type}`;
    amountEl.textContent = `¥${amount.toFixed(2)}`;

    card.appendChild(titleEl);
    card.appendChild(amountEl);

    return card;
}

export function createListItem({ mainText, rightText, rightTextClass, subText, actions }) {
    const item = document.createElement('li');
    item.className = 'list-item';

    const info = document.createElement('div');
    info.className = 'list-item-content'; // New class for content container

    const mainSpan = document.createElement('span');
    mainSpan.innerHTML = mainText;
    info.appendChild(mainSpan);

    if (rightText) {
        const rightSpan = document.createElement('span');
        rightSpan.className = `amount ${rightTextClass || ''}`;
        rightSpan.innerHTML = rightText;
        info.appendChild(rightSpan);
    }

    if (subText) {
        const subSpan = document.createElement('span');
        subSpan.className = 'sub-text';
        subSpan.innerHTML = subText;
        info.appendChild(subSpan); // Append to info div
    }

    item.appendChild(info); // Append the info div to the list item

    if (actions && actions.length > 0) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        actions.forEach(action => {
            if (action.href) {
                const link = document.createElement('a');
                link.href = action.href;
                link.className = `btn btn-sm ${action.classes || ''}`;
                link.textContent = action.text;
                actionsDiv.appendChild(link);
            } else {
                const button = document.createElement('button');
                button.className = `btn btn-sm ${action.classes || ''}`;
                button.textContent = action.text;
                if (action.ariaLabel) {
                    button.setAttribute('aria-label', action.ariaLabel);
                }
                if (action.onClick) {
                    button.addEventListener('click', action.onClick);
                }
                actionsDiv.appendChild(button);
            }
        });
        item.appendChild(actionsDiv);
    }

    return item;
}
