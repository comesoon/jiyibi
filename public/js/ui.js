// This file contains UI related functions for the app
import { t } from './i18n.js';
import { render } from './components.js';
import { showToast } from './toast.js';
import * as API from './api.js';

export function renderLayout(container, content, activeTab = 'dashboard') {
    const html = `
        <div class="app-container">
            <header class="app-header">
                <h1>${t('app_title')}</h1>
                <nav class="main-nav">
                    <a href="#" class="nav-link ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">${t('dashboard')}</a>
                    <a href="#transactions" class="nav-link ${activeTab === 'transactions' ? 'active' : ''}" data-tab="transactions">${t('transactions')}</a>
                    <a href="#categories" class="nav-link ${activeTab === 'categories' ? 'active' : ''}" data-tab="categories">${t('categories')}</a>
                    <a href="#reports" class="nav-link ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">${t('reports')}</a>
                    <a href="#settings" class="nav-link ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">${t('settings')}</a>
                </nav>
            </header>
            <div class="main-content">
                ${content}
            </div>
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