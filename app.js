let sortOrder = true; 
let usersData = [];
let filteredUsers = []; 
let currentPage = 1;
const rowsPerPage = 5;

// Função para buscar usuários da API
async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        usersData = await response.json();
        filteredUsers = usersData; 
        displayUsers(filteredUsers);
        displayPagination(filteredUsers); 
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        alert('Falha ao buscar dados da API.');
    }
}

// Função para exibir usuários na tabela com paginação
function displayUsers(users) {
    const tableBody = document.getElementById('users-table').querySelector('tbody');
    tableBody.innerHTML = ''; 

    // Paginação: Limita o número de usuários exibidos por página
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedUsers = users.slice(start, end);

    paginatedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.address.city}</td>
            <td>${user.company.name}</td>
        `;
        row.addEventListener('click', () => showUserDetails(user));
        tableBody.appendChild(row);
    });
}

// Função para exibir a paginação
function displayPagination(users) {
    let paginationDiv = document.getElementById('pagination');
    
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination';
        document.getElementById('table-container').appendChild(paginationDiv);
    } else {
        paginationDiv.innerHTML = ''; 
    }

    const totalPages = Math.ceil(users.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayUsers(users);
            updatePaginationHighlight(i);
        });
        paginationDiv.appendChild(pageButton);
    }
}

// Função para destacar a página atual na paginação
function updatePaginationHighlight(pageNumber) {
    const paginationDiv = document.getElementById('pagination');
    const buttons = paginationDiv.getElementsByTagName('button');

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.fontWeight = i + 1 === pageNumber ? 'bold' : 'normal';
    }
}

// Função para filtrar usuários com base no campo de busca
function filterUsers() {
    const filterValue = document.getElementById('search-input').value.toLowerCase();
    filteredUsers = usersData.filter(user =>
        user.name.toLowerCase().includes(filterValue)
    );

    currentPage = 1; 
    displayUsers(filteredUsers);
    displayPagination(filteredUsers);
}

// Função para ordenar a tabela ao clicar nos cabeçalhos
function sortTableByColumn(column) {
    filteredUsers.sort((a, b) => {
        const aText = getColumnData(a, column);
        const bText = getColumnData(b, column);
        return sortOrder ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    sortOrder = !sortOrder; 
    currentPage = 1; 
    displayUsers(filteredUsers);
    displayPagination(filteredUsers);
}

// Função auxiliar para obter os dados da coluna correta
function getColumnData(user, column) {
    switch (column) {
        case 'name': return user.name.toLowerCase();
        case 'username': return user.username.toLowerCase();
        case 'email': return user.email.toLowerCase();
        case 'phone': return user.phone.toLowerCase();
        case 'city': return user.address.city.toLowerCase();
        case 'company': return user.company.name.toLowerCase();
        default: return '';
    }
}

// Função para exibir os detalhes do usuário em um modal
function showUserDetails(user) {
    closeExistingModal(); 

    const modal = document.createElement('div');
    modal.id = 'user-details-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';
    modal.style.width = '80%';
    modal.style.maxWidth = '500px';
    modal.style.borderRadius = '10px';

    modal.innerHTML = `
        <h2 style="font-size: 30px;">${user.name}</h2>
        <p style="font-size: 22px;"><strong>Username:</strong> ${user.username}</p>
        <p style="font-size: 22px;"><strong>Email:</strong> ${user.email}</p>
        <p style="font-size: 22px;"><strong>Phone:</strong> ${user.phone}</p>
        <p style="font-size: 22px;"><strong>Address:</strong> ${user.address.street}, ${user.address.suite}, ${user.address.city}</p>
        <p style="font-size: 22px;"><strong>Company:</strong> ${user.company.name}</p>
        <div style="display: flex; justify-content: center;">
            <button style="font-size: 22px;" id="close-modal-button">Close</button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('close-modal-button').addEventListener('click', closeExistingModal);
    overlay.addEventListener('click', closeExistingModal);
}

// Função para fechar o modal existente
function closeExistingModal() {
    const existingModal = document.getElementById('user-details-modal');
    const existingOverlay = document.getElementById('modal-overlay');
    
    if (existingModal) document.body.removeChild(existingModal);
    if (existingOverlay) document.body.removeChild(existingOverlay);
}

//document.addEventListener('DOMContentLoaded', fetchUsers); 
document.getElementById('fetch-users').addEventListener('click', fetchUsers);
document.getElementById('search-input').addEventListener('input', filterUsers);
document.querySelectorAll('#users-table th').forEach(header => {
    header.addEventListener('click', () => {
        const column = header.textContent.toLowerCase();
        sortTableByColumn(column);
    });
});

// Função para converter os dados em CSV e baixar o arquivo
function exportToCSV(users) {
    const csvRows = [];

    // Adicionar os cabeçalhos
    const headers = ['Name', 'Username', 'Email', 'Phone', 'City', 'Company'];
    csvRows.push(headers.join(','));

    // Adicionar os dados
    users.forEach(user => {
        const row = [
            `"${user.name}"`, 
            `"${user.username}"`,
            `"${user.email}"`,
            `"${user.phone}"`,
            `"${user.address.city}"`,
            `"${user.company.name}"`
        ];
        csvRows.push(row.join(','));
    });

    // Criar o conteúdo do CSV
    const csvContent = csvRows.join('\n');

    // Criar um link de download para o CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'users_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Evento para exportar os dados ao clicar no botão
document.getElementById('export-csv-button').addEventListener('click', () => {
    exportToCSV(filteredUsers);
});


