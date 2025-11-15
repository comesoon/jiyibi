import { createStatCard, createListItem } from './components.js';
import { showToast } from './toast.js';
import * as API from './api.js';
import * as Auth from './auth.js';
import * as Chart from './chart.js';
import { t } from './i18n.js';
import { customConfirm } from './modal.js';

// This is the full and correct content of ui.js, with all functions restored and the dashboard layout corrected.

function render(container, html) {
    if (typeof html === 'string') {
        container.innerHTML = html;
    } else {
        container.innerHTML = '';
        container.appendChild(html);
    }
}

// --- Auth Views ---
export function renderLoginForm(container) {
    const html = `
        <div class="form-container">
            <h2 data-i18n="login" tabindex="-1">${t('login')}</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="email" data-i18n="email">${t('email')}</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password" data-i18n="password">${t('password')}</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn" data-i18n="login">${t('login')}</button>
                <p><span data-i18n="no_account_yet">${t('no_account_yet')}</span> <a href="#register" data-i18n="register">${t('register')}</a></p>
            </form>
        </div>
    `;
    render(container, html);
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const result = await API.login(email, password);
            Auth.login(result.token, { email: result.email, nickname: result.nickname, role: result.role });
            window.location.hash = '#dashboard';
            window.location.reload();
        } catch (error) {
            // Error is already shown by networkRequest
        }
    });
}

export function renderRegisterForm(container) {
    const html = `
        <div class="form-container">
            <h2 data-i18n="register" tabindex="-1">${t('register')}</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="email" data-i18n="email">${t('email')}</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password" data-i18n="password">${t('password')}</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-group">
                    <label for="invitationCode" data-i18n="invitation_code">${t('invitation_code')}</label>
                    <input type="text" id="invitationCode" required>
                </div>
                <button type="submit" class="btn" data-i18n="register">${t('register')}</button>
                <p><span data-i18n="already_have_account">${t('already_have_account')}</span> <a href="#login" data-i18n="login">${t('login')}</a></p>
            </form>
        </div>
    `;
    render(container, html);
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const invitationCode = document.getElementById('invitationCode').value;
        try {
            const result = await API.register(email, password, invitationCode);
            Auth.login(result.token, { email: result.email, nickname: result.nickname, role: result.role });
            showToast(t('registration_successful'), 'success');
            window.location.hash = '#dashboard';
            window.location.reload();
        } catch (error) {
            // Error is already shown by networkRequest
        }
    });
}

// --- Dashboard ---
export function renderDashboard(container, data) {
    const { ledgers = [], transactions = [], selectedLedgerId } = data;
    const user = Auth.getUser();
    const title = user && user.nickname ? `${user.nickname}的仪表盘` : t('dashboard');

    let totalIncome = 0;
    let totalExpense = 0;
    (transactions || []).forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    const dashboardEl = document.createElement('div');

    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.tabIndex = -1;
    dashboardEl.appendChild(titleEl);

    // Ledger Selector and Display
    const currentLedger = selectedLedgerId 
        ? ledgers.find(l => l._id === selectedLedgerId) 
        : null;
    const currentLedgerName = currentLedger ? currentLedger.name : t('all_ledgers');

    const ledgerSelectorHtml = `
        <div class="dashboard-controls">
            <label for="ledger-selector" class="sr-only">${t('select_ledger')}</label>
            <select id="ledger-selector" class="form-control">
                <option value="all" ${!selectedLedgerId ? 'selected' : ''}>${t('all_ledgers')}</option>
                ${ledgers.map(l => `<option value="${l._id}" ${selectedLedgerId === l._id ? 'selected' : ''}>${l.name}</option>`).join('')}
            </select>
            <span class="current-ledger-display">${t('current_ledger')}: <strong>${currentLedgerName}</strong></span>
        </div>
    `;
    dashboardEl.insertAdjacentHTML('beforeend', ledgerSelectorHtml);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'actions dashboard-actions';
    actionsEl.innerHTML = `
        <a href="#new-transaction" class="btn" data-i18n="new_transaction">${t('new_transaction')}</a>
        <a href="#new-ledger" class="btn" data-i18n="new_ledger">${t('new_ledger')}</a>
        <a href="#charts" class="btn" data-i18n="view_charts">${t('view_charts')}</a>
    `;
    dashboardEl.appendChild(actionsEl);

    const summaryEl = document.createElement('div');
    summaryEl.className = 'dashboard-summary';
    summaryEl.appendChild(createStatCard({ title: 'total_income', amount: totalIncome, type: 'text-income' }));
    summaryEl.appendChild(createStatCard({ title: 'total_expense', amount: Math.abs(totalExpense), type: 'text-expense' }));
    summaryEl.appendChild(createStatCard({ title: 'net_income', amount: totalIncome + totalExpense }));
    const ledgerCard = createStatCard({ title: 'ledger_count', amount: ledgers.length });
    ledgerCard.querySelector('.amount').textContent = ledgers.length; // Remove currency formatting
    summaryEl.appendChild(ledgerCard);
    dashboardEl.appendChild(summaryEl);

    const quickAccessTitle = document.createElement('h2');
    quickAccessTitle.dataset.i18n = 'quick_access';
    quickAccessTitle.textContent = t('quick_access');
    dashboardEl.appendChild(quickAccessTitle);

    const quickAccessCard = document.createElement('div');
    quickAccessCard.className = 'quick-access-card';
    quickAccessCard.innerHTML = `
        <ul class="quick-access-list">
            <li><a href="#transactions" data-i18n="view_all_transactions">${t('view_all_transactions')}</a></li>
            <li><a href="#ledgers" data-i18n="manage_ledgers">${t('manage_ledgers')}</a></li>
            <li><a href="#categories" data-i18n="manage_categories">${t('manage_categories')}</a></li>
        </ul>
    `;
    dashboardEl.appendChild(quickAccessCard);

    render(container, dashboardEl);

    // Add event listener for ledger selector
    document.getElementById('ledger-selector').addEventListener('change', (e) => {
        const newLedgerId = e.target.value === 'all' ? '' : e.target.value;
        if (newLedgerId) {
            localStorage.setItem('selectedLedgerId', newLedgerId);
            window.location.hash = `#dashboard?ledgerId=${newLedgerId}`;
        } else {
            localStorage.removeItem('selectedLedgerId');
            window.location.hash = `#dashboard`;
        }
    });
}

// --- Ledger Views ---
export function renderLedgerList(container, data) {
    const { ledgers = [] } = data;
    
    const page = document.createElement('div');
    page.innerHTML = `
        <div class="page-header">
            <h2 tabindex="-1">${t('manage_ledgers')}</h2>
            <div class="page-actions">
                <a href="#new-ledger" class="btn">+ ${t('new_ledger')}</a>
                <a href="#dashboard" class="btn btn-secondary">${t('dashboard')}</a>
            </div>
        </div>
    `;

    if (ledgers.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <p>${t('empty_ledgers')}</p>
            <a href="#new-ledger" class="btn">${t('new_ledger')}</a>
        `;
        page.appendChild(emptyState);
    } else {
        const list = document.createElement('ul');
        list.className = 'item-list';
        ledgers.forEach(l => {
            const item = createListItem({
                mainText: `${l.name} - ${l.currency}`,
                actions: [
                    { href: `#edit-ledger/${l._id}`, text: '编辑', classes: '' },
                    { 
                        text: '删除', 
                        classes: 'btn-danger',
                        ariaLabel: t('aria_delete_ledger', { name: l.name }),
                        onClick: async () => {
                            if (await customConfirm(t('confirm_delete_ledger'))) {
                                handleDeleteLedger(l._id);
                            }
                        }
                    }
                ]
            });
            list.appendChild(item);
        });
        page.appendChild(list);
    }

    render(container, page);
}

export async function renderLedgerForm(container, data, id) {
    const isEditMode = !!id;
    let ledger = {};

    if (isEditMode) {
        ledger = await API.getLedger(id);
        if (!ledger) {
            render(container, `<p>账本未找到。</p>`);
            return;
        }
    }

    const title = isEditMode ? '编辑账本' : t('new_ledger');
    const submitButtonText = isEditMode ? '保存' : '创建';

    const currencyOptions = ['CNY', 'USD', 'EUR'].map(c => 
        `<option value="${c}" ${ledger.currency === c ? 'selected' : ''}>${c}</option>`
    ).join('');

    const html = `
        <div class="form-container">
            <h2 tabindex="-1">${title}</h2>
            <form id="ledger-form">
                <div class="form-group">
                    <label for="name">${t('ledgers')}</label>
                    <input type="text" id="name" required value="${ledger.name || ''}">
                </div>
                <div class="form-group">
                    <label for="currency">币种</label>
                    <select id="currency">
                        ${currencyOptions}
                    </select>
                </div>
                <div class="form-actions">
                    <a href="#ledgers" class="btn btn-secondary">取消</a>
                    <button type="submit" class="btn">${submitButtonText}</button>
                </div>
            </form>
        </div>
    `;

    render(container, html);

    document.getElementById('ledger-form').addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const currency = document.getElementById('currency').value;
        
        try {
            if (isEditMode) {
                await API.updateLedger(id, { ...ledger, name, currency });
                showToast(t('ledger_updated_successfully'), 'success');
            } else {
                await API.createLedger({ name, currency });
                showToast(t('ledger_created_successfully'), 'success');
            }
            window.location.hash = '#ledgers';
        } catch (error) {
            // Error is already shown by networkRequest
        }
    });
}

async function handleDeleteLedger(id) {
    try {
        await API.deleteLedger(id);
        showToast(t('ledger_deleted_successfully'), 'success');
        window.location.hash = '#ledgers';
        window.location.reload();
    } catch (error) {
        // Error is already shown by networkRequest
    }
}

export async function renderTransactionList(container, data) {
    const { queryParams, ledgers = [], selectedLedgerId } = data;
    const initialCategoryId = queryParams.get('categoryId');

    // This function is now re-entrant and complex.
    // It fetches its own data but also receives data. Let's streamline.
    const categories = await API.getCategories();
    let currentTransactions = data.transactions || [];

    const page = document.createElement('div');
    
    const renderPage = () => {
        const categoryOptions = categories.map(c => {
            const selected = c._id === initialCategoryId ? 'selected' : '';
            const key = `category_${c.name.toLowerCase().replace(/\s+/g, '_')}`;
            const translatedName = t(key);
            return `<option value="${c._id}" ${selected}>${translatedName}</option>`;
        }).join('');

        const ledgerSelectorOptions = ledgers.map(l => 
            `<option value="${l._id}" ${selectedLedgerId === l._id ? 'selected' : ''}>${l.name}</option>`
        ).join('');

        page.innerHTML = `
            <div class="page-header">
                <h2 tabindex="-1">${t('view_all_transactions')}</h2>
                <div class="page-actions">
                    <a href="#new-transaction" class="btn">+ ${t('new_transaction')}</a>
                    <a href="#dashboard" class="btn btn-secondary">${t('dashboard')}</a>
                </div>
            </div>
            <div class="dashboard-controls">
                <label for="ledger-selector-trans" class="sr-only">${t('select_ledger')}</label>
                <select id="ledger-selector-trans" class="form-control">
                    <option value="all" ${!selectedLedgerId ? 'selected' : ''}>${t('all_ledgers')}</option>
                    ${ledgerSelectorOptions}
                </select>
            </div>
            <div class="filter-bar">
                <form id="filter-form">
                    <div class="form-group">
                        <label for="description-search">${t('search_description')}</label>
                        <input type="text" id="description-search" placeholder="${t('coffee_shopping_etc')}" value="${queryParams.get('description') || ''}">
                    </div>
                    <div class="form-group">
                        <label for="type-filter">${t('transaction_type_filter')}</label>
                        <select id="type-filter">
                            <option value="" ${!queryParams.get('type') ? 'selected' : ''}>${t('all')}</option>
                            <option value="income" ${queryParams.get('type') === 'income' ? 'selected' : ''}>${t('income')}</option>
                            <option value="expense" ${queryParams.get('type') === 'expense' ? 'selected' : ''}>${t('expense')}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="category-filter">${t('transaction_category_filter')}</label>
                        <select id="category-filter">
                            <option value="">${t('all')}</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="start-date">${t('start_date')}</label>
                        <input type="date" id="start-date" value="${queryParams.get('startDate') || ''}">
                    </div>
                    <div class="form-group">
                        <label for="end-date">${t('end_date')}</label>
                        <input type="date" id="end-date" value="${queryParams.get('endDate') || ''}">
                    </div>
                    <div class="filter-actions">
                        <button type="submit" class="btn">${t('filter')}</button>
                        <button type="button" id="clear-filters" class="btn btn-secondary">${t('clear')}</button>
                        <button type="button" id="export-xlsx" class="btn btn-secondary">${t('export_xlsx')}</button>
                    </div>
                </form>
            </div>
        `;

        const listContainer = document.createElement('div');
        if (currentTransactions.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `<p>${t('empty_transactions_filter')}</p>`;
            listContainer.appendChild(emptyState);
        } else {
            const list = document.createElement('ul');
            list.className = 'item-list';
            currentTransactions.forEach(transaction => {
                const item = createListItem({
                    mainText: `${transaction.date.substring(0,10)}: ${transaction.description}`,
                    rightText: `${transaction.type === 'income' ? '+' : '-'}¥${Math.abs(transaction.amount).toFixed(2)}`,
                    rightTextClass: transaction.type === 'expense' ? 'text-expense' : 'text-income',
                    actions: [
                        { href: `#edit-transaction/${transaction._id}`, text: t('edit'), classes: '' },
                        { 
                            text: t('delete'), 
                            classes: 'btn-danger',
                            ariaLabel: t('aria_delete_transaction', { description: transaction.description }),
                            onClick: async () => {
                                if (await customConfirm(t('confirm_delete_transaction'))) {
                                    handleDeleteTransaction(transaction._id);
                                }
                            }
                        }
                    ]
                });
                list.appendChild(item);
            });
            listContainer.appendChild(list);
        }
        page.appendChild(listContainer);
        render(container, page);

        // Add event listeners after rendering
        document.getElementById('ledger-selector-trans').addEventListener('change', handleLedgerChange);
        document.getElementById('filter-form').addEventListener('submit', handleFilterSubmit);
        document.getElementById('clear-filters').addEventListener('click', handleClearFilters);
        document.getElementById('export-xlsx').addEventListener('click', handleExport);
    };

    const handleLedgerChange = (e) => {
        const newLedgerId = e.target.value === 'all' ? '' : e.target.value;
        if (newLedgerId) {
            localStorage.setItem('selectedLedgerId', newLedgerId);
        } else {
            localStorage.removeItem('selectedLedgerId');
        }
        
        // Re-trigger the router by setting the hash, preserving other filters
        const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        // We don't need to set ledgerId in the params, as the router reads it from localStorage
        // But we need to ensure the hash changes to trigger the event listener
        queryParams.set('_t', Date.now()); // Dummy param to force hashchange
        
        window.location.hash = `#transactions?${queryParams.toString()}`;
    };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const params = {
            description: document.getElementById('description-search').value,
            type: document.getElementById('type-filter').value,
            categoryId: document.getElementById('category-filter').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
        };
        // Remove empty params
        Object.keys(params).forEach(key => {
            if (!params[key]) {
                delete params[key];
            }
        });
        
        // Update URL for bookmarking
        const newQueryString = new URLSearchParams(params).toString();
        window.location.hash = `#/transactions?${newQueryString}`;
    };

    const handleClearFilters = async () => {
        window.location.hash = '#/transactions';
    };

    const handleExport = () => {
        const params = {
            description: document.getElementById('description-search').value,
            type: document.getElementById('type-filter').value,
            categoryId: document.getElementById('category-filter').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            format: 'xlsx'
        };
        // Add ledgerId to export params if it's selected
        const ledgerId = localStorage.getItem('selectedLedgerId');
        if (ledgerId) {
            params.ledgerId = ledgerId;
        }

        Object.keys(params).forEach(key => {
            if (!params[key]) {
                delete params[key];
            }
        });
        const query = new URLSearchParams(params).toString();
        API.exportTransactions(query);
    };

    renderPage();
}

export async function renderTransactionForm(container, data, id) {
    const isEditMode = !!id;
    
    // --- 1. Data Fetching ---
    const [categories, ledgers] = await Promise.all([
        API.getCategories(),
        API.getLedgers()
    ]);

    if (!isEditMode && ledgers.length === 0) {
        const html = `
            <div class="empty-state">
                <h2 tabindex="-1">${t('new_transaction')}</h2>
                <p>${t('must_create_ledger_first')}</p>
                <a href="#new-ledger" class="btn">${t('new_ledger')}</a>
                <a href="#dashboard" class="btn btn-secondary" style="margin-top: 1rem;">${t('dashboard')}</a>
            </div>
        `;
        render(container, html);
        return;
    }

    let transaction = {};
    if (isEditMode) {
        transaction = await API.getTransaction(id);
        if (!transaction) {
            render(container, `<p>账目未找到。</p>`);
            return;
        }
    }

    // --- 2. Dynamic Content ---
    const title = isEditMode ? '编辑账目' : t('new_transaction');
    const submitButtonText = isEditMode ? '保存' : '添加';

    // --- 3. HTML Generation ---
    const ledgerOptions = ledgers.map(l => 
        `<option value="${l._id}" ${transaction.ledger === l._id ? 'selected' : ''}>${l.name}</option>`
    ).join('');

    const generateCategoryOptions = (selectedType) => {
        return categories
            .filter(c => c.type === selectedType)
            .map(c => {
                const isSelected = isEditMode && c._id === transaction.category;
                const translationKey = `category_${c.name.toLowerCase().replace(/\s+/g, '_')}`;
                const translatedName = t(translationKey);
                return `<option value="${c._id}" ${isSelected ? 'selected' : ''}>${translatedName}</option>`;
            }).join('');
    };

    const initialType = transaction.type || 'expense';
    const initialCategoryOptions = generateCategoryOptions(initialType);

    const html = `
        <div class="form-container">
            <h2 tabindex="-1">${title}</h2>
            <form id="transaction-form">
                <div class="form-group">
                    <label for="description">描述</label>
                    <input type="text" id="description" required value="${transaction.description || ''}">
                </div>
                <div class="form-group">
                    <label for="amount">金额</label>
                    <input type="number" id="amount" step="0.01" required value="${transaction.amount ? Math.abs(transaction.amount) : ''}">
                </div>
                <div class="form-group">
                    <label for="type">类型</label>
                    <select id="type">
                        <option value="expense" ${initialType === 'expense' ? 'selected' : ''}>${t('expense')}</option>
                        <option value="income" ${initialType === 'income' ? 'selected' : ''}>${t('income')}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="category">${t('categories')}</label>
                    <select id="category" required>${initialCategoryOptions}</select>
                </div>
                <div class="form-group">
                    <label for="ledger">${t('ledgers')}</label>
                    <select id="ledger" required>${ledgerOptions}</select>
                </div>
                <div class="form-group">
                    <label for="date">日期</label>
                    <input type="date" id="date" required value="${transaction.date ? transaction.date.substring(0, 10) : new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-actions">
                    <a href="#transactions" class="btn btn-secondary">取消</a>
                    <button type="submit" class="btn">${submitButtonText}</button>
                </div>
            </form>
        </div>
    `;
    render(container, html);

    // --- 4. Event Listeners ---
    const typeSelector = document.getElementById('type');
    const categorySelector = document.getElementById('category');
    typeSelector.addEventListener('change', (e) => {
        categorySelector.innerHTML = generateCategoryOptions(e.target.value);
    });

    document.getElementById('transaction-form').addEventListener('submit', async e => {
        e.preventDefault();
        const transactionData = {
            description: document.getElementById('description').value,
            amount: parseFloat(document.getElementById('amount').value),
            type: document.getElementById('type').value,
            category: document.getElementById('category').value,
            ledger: document.getElementById('ledger').value,
            date: document.getElementById('date').value,
        };

        try {
            if (isEditMode) {
                await API.updateTransaction(id, { ...transaction, ...transactionData });
                showToast(t('transaction_updated_successfully'), 'success');
            } else {
                await API.createTransaction(transactionData);
                showToast(t('transaction_created_successfully'), 'success');
            }
            window.location.hash = '#transactions';
        } catch (error) {
            // Error is already shown by networkRequest
        }
    });
}

async function handleDeleteTransaction(id) {
    try {
        await API.deleteTransaction(id);
        showToast(t('transaction_deleted_successfully'), 'success');
        window.location.hash = '#transactions';
        window.location.reload();
    } catch (error) {
        // Error is already shown by networkRequest
    }
}

// --- Other Views ---
export function renderCategoryList(container, data) {
    const { categories = [] } = data;

    let content;
    if (categories.length === 0) {
        content = `
            <div class="empty-state">
                <p>${t('empty_categories')}</p>
                <a href="#new-category" class="btn">${t('new_category')}</a>
            </div>
        `;
    } else {
        const incomeCategories = categories.filter(c => c.type === 'income');
        const expenseCategories = categories.filter(c => c.type === 'expense');

        const renderList = (catList) => catList.map(c => {
            const translationKey = `category_${c.name.toLowerCase().replace(/\s+/g, '_')}`;
            const translatedName = t(translationKey);
            return `<li class="list-item">${translatedName}</li>`;
        }).join('');

        content = `
            <h3 class="category-list-header">${t('income_categories')}</h3>
            ${incomeCategories.length > 0 ? `<ul class="item-list">${renderList(incomeCategories)}</ul>` : `<p>${t('empty_categories')}</p>`}

            <h3 class="category-list-header">${t('expense_categories')}</h3>
            ${expenseCategories.length > 0 ? `<ul class="item-list">${renderList(expenseCategories)}</ul>` : `<p>${t('empty_categories')}</p>`}
        `;
    }

    const html = `
        <div>
            <div class="page-header">
                <h2 tabindex="-1">${t('manage_categories')}</h2>
                <div class="page-actions">
                    <a href="#new-category" class="btn">+ ${t('new_category')}</a>
                    <a href="#dashboard" class="btn btn-secondary">${t('dashboard')}</a>
                </div>
            </div>
            ${content}
        </div>
    `;
    render(container, html);
}

export function renderCategoryForm(container) {

    const html = `

        <div class="form-container">

            <h2 tabindex="-1">${t('manage_categories')}</h2>

            <form id="category-form">

                <div class="form-group">

                    <label for="name">分类名称</label>

                    <input type="text" id="name" required>

                </div>

                <div class="form-group">

                    <label for="type">分类类型</label>

                    <select id="type" required>

                        <option value="">请选择类型</option>

                        <option value="income">收入</option>

                        <option value="expense">支出</option>

                    </select>

                </div>

                <div class="form-actions">

                    <a href="#categories" class="btn btn-secondary">取消</a>

                    <button type="submit" class="btn">创建</button>

                </div>

            </form>

        </div>

    `;

    render(container, html);

    // 使用 setTimeout 确保 DOM 已经更新完成
    setTimeout(() => {
        const form = document.getElementById('category-form');
        if (form) {
            form.addEventListener('submit', async e => {

                e.preventDefault();

                const name = document.getElementById('name').value;

                const type = document.getElementById('type').value;

                try {

                    await API.createCategory({ name, type });

                    showToast(t('category_created_successfully'), 'success');

                    window.location.hash = '#categories';

                } catch (error) {

                    // Error is already shown by networkRequest

                }

            });
        }
    }, 0);
}

function getWeekStartDate(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

function processTrendData(transactions, granularity) {
    const monthlyData = {};
    (transactions || []).forEach(t => {
        let key;
        switch (granularity) {
            case 'day':
                key = t.date.substring(0, 10);
                break;
            case 'week':
                key = getWeekStartDate(t.date);
                break;
            case 'year':
                key = t.date.substring(0, 4);
                break;
            case 'month':
            default:
                key = t.date.substring(0, 7);
                break;
        }

        if (!monthlyData[key]) {
            monthlyData[key] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            monthlyData[key].income += t.amount;
        } else {
            monthlyData[key].expense += t.amount;
        }
    });
    const labels = Object.keys(monthlyData).sort();
    const incomeData = labels.map(label => monthlyData[label].income);
    const expenseData = labels.map(label => Math.abs(monthlyData[label].expense));
    return { labels, incomeData, expenseData };
}

export function renderChartView(container, data) {
    const { ledgers = [], transactions = [], categories = [], selectedLedgerId } = data;

    const currentLedger = selectedLedgerId 
        ? ledgers.find(l => l._id === selectedLedgerId) 
        : null;
    const currentLedgerName = currentLedger ? currentLedger.name : t('all_ledgers');

    const html = `
        <div>
            <div class="page-header">
                 <h2 data-i18n="data_charts" tabindex="-1">${t('data_charts')}</h2>
                 <div class="page-actions">
                    <a href="#dashboard" class="btn btn-secondary">${t('dashboard')}</a>
                </div>
            </div>
            <div class="chart-ledger-display">
                <span>${t('current_ledger')}: <strong>${currentLedgerName}</strong></span>
            </div>
            <div class="chart-controls">
                <select id="chart-type">
                    <option value="trend" data-i18n="trend_chart">${t('trend_chart')}</option>
                    <option value="bar" data-i18n="bar_chart">${t('bar_chart')}</option>
                    <option value="pie" data-i18n="expense_pie_chart">${t('expense_pie_chart')}</option>
                </select>
                <div class="granularity-controls">
                    <button class="btn btn-sm" data-granularity="day">${t('day')}</button>
                    <button class="btn btn-sm" data-granularity="week">${t('week')}</button>
                    <button class="btn btn-sm active" data-granularity="month">${t('month')}</button>
                    <button class="btn btn-sm" data-granularity="year">${t('year')}</button>
                </div>
            </div>
            <div class="chart-container" style="height: 400px;">
                <canvas id="main-chart"></canvas>
            </div>
        </div>
    `;
    render(container, html);

    const ctx = document.getElementById('main-chart').getContext('2d');
    const chartTypeSelector = document.getElementById('chart-type');
    const granularityControls = document.querySelector('.granularity-controls');

    let currentGranularity = 'month';

    const drawChart = () => {
        const chartType = chartTypeSelector.value;
        
        granularityControls.style.display = (chartType === 'trend' || chartType === 'bar') ? 'flex' : 'none';

        if (chartType === 'trend') {
            const chartData = processTrendData(transactions, currentGranularity);
            Chart.createTrendChart(ctx, chartData);
        } else if (chartType === 'bar') {
            const chartData = processTrendData(transactions, currentGranularity);
            Chart.createBarChart(ctx, chartData);
        } else if (chartType === 'pie') {
            const chartData = processPieData(transactions);
            Chart.createPieChart(ctx, chartData);
        }
    };

    chartTypeSelector.addEventListener('change', drawChart);
    
    granularityControls.addEventListener('click', (e) => {
        if (e.target.matches('button')) {
            currentGranularity = e.target.dataset.granularity;
            
            granularityControls.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');

            drawChart();
        }
    });

    drawChart();
}

function processPieData(transactions) {
    const expenseByCategory = {};

    (transactions || []).forEach(t => {
        if (t.type === 'expense' && t.category) {
            const categoryName = t.category.name || 'Uncategorized';
            const categoryId = t.category._id;

            if (!expenseByCategory[categoryName]) {
                expenseByCategory[categoryName] = { total: 0, categoryId: categoryId };
            }
            expenseByCategory[categoryName].total += Math.abs(t.amount);
        }
    });

    const labels = Object.keys(expenseByCategory);
    const translatedLabels = labels.map(label => {
        const key = `category_${label.toLowerCase().replace(/\s+/g, '_')}`;
        return t(key);
    });
    const values = labels.map(label => expenseByCategory[label].total);
    const categoryIds = labels.map(label => expenseByCategory[label].categoryId);
    
    return { labels: translatedLabels, values, categoryIds };
}

export async function renderProfilePage(container) {
    const user = await API.getUserProfile();
    const currentLang = localStorage.getItem('lang') || 'zh';
    const currentTheme = localStorage.getItem('theme') || 'green';

    const themes = [
        'green', 'blue', 'dark', 'red', 'pink', 'purple',
        'indigo', 'cyan', 'teal', 'orange', 'brown', 'grey'
    ];

    const themeOptions = themes.map(theme => {
        const selected = currentTheme === theme ? 'selected' : '';
        return `<option value="${theme}" ${selected}>${t(`theme_${theme}`)}</option>`;
    }).join('');

    const html = `
        <div class="form-container">
            <h2 tabindex="-1">个人资料</h2>
            <form id="profile-form">
                <div class="form-group">
                    <label for="email">账号</label>
                    <input type="email" id="email" value="${user.email}" disabled>
                </div>
                <div class="form-group">
                    <label for="nickname">昵称</label>
                    <input type="text" id="nickname" value="${user.nickname || ''}">
                </div>
                <div class="form-group">
                    <label for="password">新密码 (不修改请留空)</label>
                    <input type="password" id="password">
                </div>

                <div class="form-group">
                    <label for="language-switcher">语言</label>
                    <select id="language-switcher">
                        <option value="zh" ${currentLang === 'zh' ? 'selected' : ''}>中文</option>
                        <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="theme-switcher">主题</label>
                    <select id="theme-switcher">
                        ${themeOptions}
                    </select>
                </div>

                <div class="form-actions">
                    <a href="#dashboard" class="btn btn-secondary">取消</a>
                    <button type="submit" class="btn">保存</button>
                </div>
            </form>
        </div>
    `;
    render(container, html);

    const themeSwitcher = document.getElementById('theme-switcher');
    themeSwitcher.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    const langSwitcher = document.getElementById('language-switcher');
    langSwitcher.addEventListener('change', async (e) => {
        await i18n.setLang(e.target.value);
        window.location.reload();
    });

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = document.getElementById('nickname').value;
        const password = document.getElementById('password').value;

        const data = { nickname };
        if (password) {
            data.password = password;
        }

        try {
            const updatedUser = await API.updateUserProfile(data);
            // Update user info in localStorage
            const storedUser = Auth.getUser();
            storedUser.nickname = updatedUser.nickname;
            Auth.login(Auth.getToken(), storedUser); // Re-login to update stored user

            showToast(t('profile_updated_successfully'), 'success');
            window.location.hash = '#dashboard';
        } catch (error) {
            // Error is already shown by networkRequest
        }
    });
}

export async function renderInvitationCodeManagement(container, data) {
    const { invitationCodes = [] } = data;

    const page = document.createElement('div');
    page.innerHTML = `
        <div class="page-header">
            <h2 tabindex="-1">${t('manage_invitation_codes')}</h2>
            <div class="page-actions">
                <button id="generate-code-btn" class="btn">${t('generate_new_code')}</button>
                <a href="#admin/dashboard" class="btn btn-secondary">${t('admin_dashboard')}</a>
            </div>
        </div>
    `;

    if (invitationCodes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `<p>${t('no_invitation_codes')}</p>`;
        page.appendChild(emptyState);
    } else {
        const list = document.createElement('ul');
        list.className = 'item-list';
        invitationCodes.forEach(code => {
            const item = createListItem({
                mainText: `<span class="list-item-label">${t('code')}:</span> <span class="list-item-value">${code.code}</span>`,
                rightText: `<span class="list-item-label">${t('uses_left')}:</span> <span class="list-item-value">${code.usesLeft}</span>`,
                subText: `<span class="list-item-label">${t('created_at')}:</span> <span class="list-item-value">${new Date(code.createdAt).toLocaleString()}</span>`
            });
            list.appendChild(item);
        });
        page.appendChild(list);
    }

    render(container, page);

    document.getElementById('generate-code-btn').addEventListener('click', async () => {
        try {
            await API.createInvitationCode();
            showToast(t('generate_code_success'), 'success');
            window.location.reload(); // Reload to show the new code
        } catch (error) {
            // Error is already shown by networkRequest
        }
    });
}


// --- Admin Views ---

export function renderAdminDashboard(container) {
    const html = `
        <div>
            <div class="page-header">
                <h2 tabindex="-1">${t('admin_dashboard')}</h2>
            </div>
            <div class="quick-access-card">
                <ul class="quick-access-list">
                    <li><a href="#admin/users">${t('user_management')}</a></li>
                    <li><a href="#admin/invitations">${t('manage_invitation_codes')}</a></li>
                </ul>
            </div>
        </div>
    `;
    render(container, html);
}

export function renderUserManagement(container, data) {
    const { users = [] } = data;
    const currentUser = Auth.getUser();

    const page = document.createElement('div');
    page.innerHTML = `
        <div class="page-header">
            <h2 tabindex="-1">${t('user_management')}</h2>
            <div class="page-actions">
                <a href="#admin/dashboard" class="btn btn-secondary">${t('admin_dashboard')}</a>
            </div>
        </div>
    `;

    const list = document.createElement('ul');
    list.className = 'item-list';
    users.forEach(user => {
        const actions = [];
        // Prevent admin from demoting themselves
        if (user._id !== currentUser._id) {
            if (user.role === 'user') {
                actions.push({
                    text: t('promote_to_isacc'),
                    classes: 'btn-primary',
                    onClick: () => handleRoleChange(user._id, 'isacc')
                });
            } else {
                actions.push({
                    text: t('demote_to_user'),
                    classes: 'btn-secondary',
                    onClick: () => handleRoleChange(user._id, 'user')
                });
            }
        }

        const item = createListItem({
            mainText: `<span class="list-item-label">Email:</span> <span class="list-item-value">${user.email}</span>`,
            rightText: `<span class="list-item-label">${t('role')}:</span> <span class="list-item-value">${user.role}</span>`,
            subText: user.nickname ? `<span class="list-item-label">Nickname:</span> <span class="list-item-value">${user.nickname}</span>` : '',
            actions: actions
        });
        list.appendChild(item);
    });
    page.appendChild(list);

    render(container, page);
}

async function handleRoleChange(userId, newRole) {
    if (await customConfirm(t('confirm_role_change', { role: newRole }))) {
        try {
            await API.updateUserRole(userId, newRole);
            showToast(t('update_role_success'), 'success');
            window.location.reload();
        } catch (error) {
            // Error is already shown by networkRequest
        }
    }
}

export function renderNotFound(container) {
    render(container, `<h2 tabindex="-1">404 - Page Not Found</h2>`);
}