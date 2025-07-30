document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const typeInput = document.getElementById('type');
    const categoryInput = document.getElementById('category');
    const transactionsList = document.getElementById('transactions');
    const balanceElement = document.getElementById('balance');
    const incomeTotalElement = document.getElementById('income-total');
    const expenseTotalElement = document.getElementById('expense-total');
    const filterTypeInput = document.getElementById('filter-type');
    const filterCategoryInput = document.getElementById('filter-category');
    const themeToggle = document.getElementById('theme-toggle');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    init();

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const transaction = {
            id: generateId(),
            description: descriptionInput.value.trim(),
            amount: parseFloat(amountInput.value),
            date: dateInput.value,
            type: typeInput.value,
            category: categoryInput.value
        };

        addTransaction(transaction);
        updateLocalStorage();
        updateUI();
        resetForm();
        showSuccessMessage('Transaction added successfully!');
    });

    filterTypeInput.addEventListener('change', updateUI);
    filterCategoryInput.addEventListener('change', updateUI);

    themeToggle.addEventListener('change', function () {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    function init() {
        updateUI();
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function addTransaction(transaction) {
        transactions.unshift(transaction);
    }

    function removeTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== parseInt(id));
    }

    function updateLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function updateUI() {
        const filteredTransactions = filterTransactions();
        displayTransactions(filteredTransactions);
        updateBalance();
        updateSummary();
    }

    function filterTransactions() {
        const typeFilter = filterTypeInput.value;
        const categoryFilter = filterCategoryInput.value;

        return transactions.filter(transaction => {
            const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
            const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
            return typeMatch && categoryMatch;
        });
    }

    function displayTransactions(transactionsToDisplay) {
        transactionsList.innerHTML = '';

        if (transactionsToDisplay.length === 0) {
            transactionsList.innerHTML = '<li class="no-transactions"><i class="fas fa-coins"></i> No transactions found</li>';
            return;
        }

        transactionsToDisplay.forEach(transaction => {
            const sign = transaction.type === 'income' ? '+' : '-';
            const transactionElement = document.createElement('li');
            transactionElement.classList.add('transaction', transaction.type);

            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount">${sign}₹${Math.abs(transaction.amount).toFixed(2)}</div>
                <button class="delete-btn" data-id="${transaction.id}" aria-label="Delete transaction">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

            transactionsList.appendChild(transactionElement);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                console.log('Delete clicked for ID:', id); // Debug
                removeTransaction(id);
                updateLocalStorage();
                updateUI();
                showSuccessMessage('Transaction deleted!');
            });
        });
    }

    function updateBalance() {
        const amounts = transactions.map(transaction =>
            transaction.type === 'income' ? transaction.amount : -transaction.amount
        );

        const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
        balanceElement.textContent = `₹${total}`;

        if (total > 0) {
            balanceElement.style.color = 'var(--income-color)';
        } else if (total < 0) {
            balanceElement.style.color = 'var(--expense-color)';
        } else {
            balanceElement.style.color = 'inherit';
        }
    }

    function updateSummary() {
        const income = transactions
            .filter(transaction => transaction.type === 'income')
            .reduce((acc, transaction) => acc + transaction.amount, 0)
            .toFixed(2);

        const expense = transactions
            .filter(transaction => transaction.type === 'expense')
            .reduce((acc, transaction) => acc + transaction.amount, 0)
            .toFixed(2);

        incomeTotalElement.textContent = `₹${income}`;
        expenseTotalElement.textContent = `₹${expense}`;
    }

    function resetForm() {
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    function validateForm() {
        if (descriptionInput.value.trim() === '') {
            showErrorMessage('Please enter a description');
            descriptionInput.focus();
            return false;
        }

        if (amountInput.value === '' || parseFloat(amountInput.value) <= 0) {
            showErrorMessage('Please enter a valid amount greater than 0');
            amountInput.focus();
            return false;
        }

        if (dateInput.value === '') {
            showErrorMessage('Please select a date');
            dateInput.focus();
            return false;
        }

        if (categoryInput.value === '') {
            showErrorMessage('Please select a category');
            categoryInput.focus();
            return false;
        }

        return true;
    }

    function showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    function showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    function generateId() {
        return Date.now() + Math.floor(Math.random() * 1000); // ensures unique numeric ID
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});
