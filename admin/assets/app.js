document.addEventListener('DOMContentLoaded', () => {
    const CSRF_TOKEN = window.ADMIN_CSRF_TOKEN || '';
    const csrfHeaders = () => CSRF_TOKEN ? { 'X-CSRF-Token': CSRF_TOKEN } : {};
    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    const escapeAttr = escapeHtml;
    const safeInt = (value) => Number.parseInt(value, 10) || 0;
    const safeImagePath = (value) => {
        const normalized = String(value ?? '').trim().replace(/^\.?\//, '');
        return /^(uploads|assets)\/[A-Za-z0-9._/-]+\.(jpe?g|png|webp|gif)$/i.test(normalized) ? normalized : '';
    };

    // SPA Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            // Update active state in nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            // Show target view, hide others
            views.forEach(v => {
                if (v.id === targetId) {
                    v.classList.add('active');
                    loadViewData(targetId);
                } else {
                    v.classList.remove('active');
                }
            });
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await fetch('api/auth.php?action=logout', {
                method: 'POST',
                headers: csrfHeaders()
            });
            window.location.href = 'login.php';
        } catch(e) {
            console.error('Erro ao sair', e);
        }
    });

    // View Loading Logic
    function loadViewData(viewId) {
        if (viewId === 'dashboard-view') {
            loadDashboardStats();
        } else if (viewId === 'categories-view') {
            loadCategories();
        } else if (viewId === 'items-view') {
            loadItems();
        } else if (viewId === 'events-view') {
            loadEvents();
        } else if (viewId === 'gallery-view') {
            loadGallery();
        }
    }

    // Modal Logic
    const modalOverlay = document.getElementById('modal-overlay');
    const btnCloseModal = document.querySelector('.close-modal');
    
    function openModal(title, contentHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHtml;
        modalOverlay.classList.remove('hidden');
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
    }

    btnCloseModal.addEventListener('click', closeModal);

    // Global Functions for onClick events
    window.editCategory = async (id) => {
        try {
            const res = await fetch('api/categories.php?action=list');
            const data = await res.json();
            const cat = data.data.find(c => c.id == id);
            
            if(cat) {
                openModal('Editar Categoria', `
                    <form id="form-category-edit" onsubmit="window.saveCategory(event, ${safeInt(id)})">
                        <div class="form-group">
                            <label>Nome da Categoria</label>
                            <input type="text" class="form-control" name="nome" value="${escapeAttr(cat.nome)}" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo de Aplicação</label>
                            <select class="form-control" name="tipo_aplicacao">
                                <option value="item" ${cat.tipo_aplicacao == 'item' ? 'selected' : ''}>Estabelecimento/Serviço</option>
                                <option value="evento" ${cat.tipo_aplicacao == 'evento' ? 'selected' : ''}>Evento</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Atualizar</button>
                    </form>
                `);
            }
        } catch(e) { console.error(e); }
    };

    window.saveCategory = async (e, id = null) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const url = id ? `api/categories.php?action=update&id=${id}` : 'api/categories.php?action=create';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if(result.success) {
                closeModal();
                loadCategories();
                loadDashboardStats();
            } else {
                alert(result.error || 'Erro ao salvar categoria');
            }
        } catch(err) {
            console.error(err);
        }
    };

    window.editItem = async (id) => {
        try {
            const res = await fetch('api/items.php?action=list');
            const data = await res.json();
            const item = data.data.find(i => i.id == id);
            
            // Fetch categories for select
            const catRes = await fetch('api/categories.php?action=list');
            const catData = await catRes.json();
            let catOptions = '<option value="">Sem Categoria</option>';
            if(catData.data) {
                catData.data.forEach(c => {
                    catOptions += `<option value="${safeInt(c.id)}" ${item && item.categoria_id == c.id ? 'selected' : ''}>${escapeHtml(c.nome)}</option>`;
                });
            }
            
            if(item) {
                openModal('Editar Publicação', getItemFormHTML(item, catOptions, safeInt(id)));
            }
        } catch(e) { console.error(e); }
    };
    
    function getItemFormHTML(item, catOptions, id = null) {
        return `
            <form id="form-item" onsubmit="window.saveItem(event, ${id ? safeInt(id) : 'null'})">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" class="form-control" name="titulo" value="${item ? escapeAttr(item.titulo) : ''}" required>
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <select class="form-control" name="categoria_id">
                        ${catOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Endereço / Localização</label>
                    <input type="text" class="form-control" name="endereco" value="${item ? escapeAttr(item.endereco) : ''}">
                </div>
                <div class="form-group">
                    <label>Filtros (Opcional - Separe por vírgula)</label>
                    <input type="text" class="form-control" name="filtros" value="${item && item.filtros ? escapeAttr(item.filtros) : ''}" placeholder="Ex: cafe-da-manha, almoco, lanchonete">
                </div>
                <div class="form-group">
                    <label>Upload de Capa (JPG/PNG)</label>
                    <input type="file" class="form-control" id="item-image" accept="image/jpeg,image/png,image/webp">
                    <input type="hidden" name="imagem_capa" id="imagem_capa_hidden" value="${item ? escapeAttr(item.imagem_capa) : ''}">
                    ${item && item.imagem_capa ? `<small style="display:block; margin-top:8px;">Imagem atual salva.</small>` : ''}
                </div>
                <button type="submit" class="btn btn-primary" id="btn-save-item" style="width:100%; justify-content:center;">Salvar Publicação</button>
            </form>
        `;
    }

    window.saveItem = async (e, id = null) => {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('btn-save-item');
        btn.textContent = 'Salvando...';
        btn.disabled = true;

        try {
            // Check if there is an image to upload first
            const fileInput = document.getElementById('item-image');
            if(fileInput.files.length > 0) {
                const imgData = new FormData();
                imgData.append('image', fileInput.files[0]);
                
                const upRes = await fetch('api/upload.php', { method: 'POST', headers: csrfHeaders(), body: imgData });
                const upResult = await upRes.json();
                if(upResult.success) {
                    document.getElementById('imagem_capa_hidden').value = upResult.data.url;
                } else {
                    alert('Erro ao enviar imagem: ' + upResult.error);
                    btn.textContent = 'Salvar Publicação';
                    btn.disabled = false;
                    return;
                }
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            // convert empty strings to null for DB
            if(!data.categoria_id) data.categoria_id = null;
            
            const url = id ? `api/items.php?action=update&id=${id}` : 'api/items.php?action=create';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if(result.success) {
                closeModal();
                loadItems();
                loadDashboardStats();
            } else {
                alert(result.error || 'Erro ao salvar item');
            }
        } catch(err) {
            console.error(err);
        } finally {
            btn.textContent = 'Salvar Publicação';
            btn.disabled = false;
        }
    };

    // Load Dashboard Stats
    async function loadDashboardStats() {
        try {
            const [catRes, itemRes] = await Promise.all([
                fetch('api/categories.php?action=list'),
                fetch('api/items.php?action=list')
            ]);
            
            const catData = await catRes.json();
            const itemData = await itemRes.json();
            
            document.getElementById('stat-categories').textContent = catData.data ? catData.data.length : '--';
            document.getElementById('stat-items').textContent = itemData.data ? itemData.data.length : '--';
        } catch(e) {
            console.error('Erro ao carregar stats', e);
        }
    }

    // Load Categories
    async function loadCategories() {
        const tbody = document.getElementById('categories-tbody');
        tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        
        try {
            const res = await fetch('api/categories.php?action=list');
            const data = await res.json();
            
            if (data.success && data.data) {
                tbody.innerHTML = '';
                data.data.forEach(cat => {
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${escapeHtml(cat.nome)}</strong><br><small class="text-muted">/${escapeHtml(cat.slug)}</small></td>
                            <td>${escapeHtml(cat.tipo_aplicacao)}</td>
                            <td>${safeInt(cat.ordem)}</td>
                            <td><span class="status-badge ${cat.ativo ? 'status-active' : ''}">${cat.ativo ? 'Ativo' : 'Inativo'}</span></td>
                            <td>
                                <button class="btn" style="padding: 6px 12px; background: rgba(255,255,255,0.1); border-radius: 6px;" onclick="editCategory(${safeInt(cat.id)})">Editar</button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch(e) {
            console.error('Erro ao carregar categorias', e);
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar.</td></tr>';
        }
    }

    // Load Items
    async function loadItems() {
        const tbody = document.getElementById('items-tbody');
        tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        
        try {
            const res = await fetch('api/items.php?action=list');
            const data = await res.json();
            
            if (data.success && data.data) {
                tbody.innerHTML = '';
                data.data.forEach(item => {
                    tbody.innerHTML += `
                        <tr>
                            <td>
                                ${safeImagePath(item.imagem_capa) ? `<img src="../${escapeAttr(safeImagePath(item.imagem_capa))}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" alt="">` : '<div style="width:50px; height:50px; background:#333; border-radius:8px;"></div>'}
                            </td>
                            <td><strong>${escapeHtml(item.titulo)}</strong><br><small class="text-muted">${escapeHtml(item.endereco)}</small></td>
                            <td>${escapeHtml(item.categoria_nome || 'Sem Categoria')}</td>
                            <td><span class="status-badge ${item.ativo ? 'status-active' : ''}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                            <td>
                                <button class="btn" style="padding: 6px 12px; background: rgba(255,255,255,0.1); border-radius: 6px;" onclick="editItem(${safeInt(item.id)})">Editar</button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch(e) {
            console.error('Erro ao carregar itens', e);
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar.</td></tr>';
        }
    }

    // Load Events
    async function loadEvents() {
        const tbody = document.getElementById('events-tbody');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        
        try {
            const res = await fetch('api/events.php?action=list');
            const data = await res.json();
            
            if (data.success && data.data) {
                tbody.innerHTML = '';
                data.data.forEach(ev => {
                    const dataFormatada = new Date(ev.data_inicio).toLocaleDateString('pt-BR', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
                    tbody.innerHTML += `
                        <tr>
                            <td>
                                ${safeImagePath(ev.imagem_capa) ? `<img src="../${escapeAttr(safeImagePath(ev.imagem_capa))}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" alt="">` : '<div style="width:50px; height:50px; background:#333; border-radius:8px;"></div>'}
                            </td>
                            <td><strong>${escapeHtml(ev.titulo)}</strong></td>
                            <td>${dataFormatada}</td>
                            <td>${escapeHtml(ev.local_nome || ev.endereco || 'Não informado')}</td>
                            <td>
                                <button class="btn" style="padding: 6px 12px; background: rgba(255,255,255,0.1); border-radius: 6px;" onclick="editEvent(${safeInt(ev.id)})">Editar</button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch(e) {
            console.error('Erro ao carregar eventos', e);
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar.</td></tr>';
        }
    }

    window.editEvent = async (id) => {
        try {
            const res = await fetch('api/events.php?action=list');
            const data = await res.json();
            const ev = data.data.find(i => i.id == id);
            
            const catRes = await fetch('api/categories.php?action=list');
            const catData = await catRes.json();
            let catOptions = '<option value="">Sem Categoria</option>';
            if(catData.data) {
                catData.data.forEach(c => {
                    if (c.tipo_aplicacao === 'evento') {
                        catOptions += `<option value="${safeInt(c.id)}" ${ev && ev.categoria_id == c.id ? 'selected' : ''}>${escapeHtml(c.nome)}</option>`;
                    }
                });
            }
            
            if(ev) openModal('Editar Evento', getEventFormHTML(ev, catOptions, safeInt(id)));
        } catch(e) { console.error(e); }
    };

    function getEventFormHTML(ev, catOptions, id = null) {
        // Convert datetime to local-datetime string for input
        let startStr = '', endStr = '';
        if (ev && ev.data_inicio) startStr = ev.data_inicio.replace(' ', 'T').substring(0, 16);
        if (ev && ev.data_fim) endStr = ev.data_fim.replace(' ', 'T').substring(0, 16);

        return `
            <form id="form-event" onsubmit="window.saveEvent(event, ${id ? safeInt(id) : 'null'})">
                <div class="form-group">
                    <label>Título do Evento</label>
                    <input type="text" class="form-control" name="titulo" value="${ev ? escapeAttr(ev.titulo) : ''}" required>
                </div>
                <div class="form-group">
                    <label>Categoria de Evento</label>
                    <select class="form-control" name="categoria_id">
                        ${catOptions}
                    </select>
                </div>
                <div style="display:flex; gap:10px;">
                    <div class="form-group" style="flex:1;">
                        <label>Data Início</label>
                        <input type="datetime-local" class="form-control" name="data_inicio" value="${startStr}" required>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>Data Fim</label>
                        <input type="datetime-local" class="form-control" name="data_fim" value="${endStr}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Local (Nome)</label>
                    <input type="text" class="form-control" name="local_nome" value="${ev ? escapeAttr(ev.local_nome) : ''}">
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea class="form-control" name="descricao_completa" rows="3">${ev ? escapeHtml(ev.descricao_completa) : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Upload de Capa (JPG/PNG)</label>
                    <input type="file" class="form-control" id="event-image" accept="image/jpeg,image/png,image/webp">
                    <input type="hidden" name="imagem_capa" id="event_imagem_capa_hidden" value="${ev ? escapeAttr(ev.imagem_capa) : ''}">
                    ${ev && ev.imagem_capa ? `<small style="display:block; margin-top:8px;">Imagem atual salva.</small>` : ''}
                </div>
                <button type="submit" class="btn btn-primary" id="btn-save-event" style="width:100%; justify-content:center;">Salvar Evento</button>
            </form>
        `;
    }

    window.saveEvent = async (e, id = null) => {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('btn-save-event');
        btn.textContent = 'Salvando...';
        btn.disabled = true;

        try {
            const fileInput = document.getElementById('event-image');
            if(fileInput.files.length > 0) {
                const imgData = new FormData();
                imgData.append('image', fileInput.files[0]);
                
                const upRes = await fetch('api/upload.php', { method: 'POST', headers: csrfHeaders(), body: imgData });
                const upResult = await upRes.json();
                if(upResult.success) {
                    document.getElementById('event_imagem_capa_hidden').value = upResult.data.url;
                } else {
                    alert('Erro ao enviar imagem: ' + upResult.error);
                    btn.textContent = 'Salvar Evento';
                    btn.disabled = false;
                    return;
                }
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            if(!data.categoria_id) data.categoria_id = null;
            
            const url = id ? `api/events.php?action=update&id=${id}` : 'api/events.php?action=create';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if(result.success) {
                closeModal();
                loadEvents();
            } else {
                alert(result.error || 'Erro ao salvar evento');
            }
        } catch(err) {
            console.error(err);
        } finally {
            btn.textContent = 'Salvar Evento';
            btn.disabled = false;
        }
    };

    // Load Gallery
    async function loadGallery() {
        const grid = document.getElementById('gallery-grid');
        if(!grid) return;
        grid.innerHTML = '<p>Carregando fotos...</p>';
        
        try {
            const res = await fetch('api/gallery.php?action=list');
            const data = await res.json();
            
            if (data.success && data.data) {
                grid.innerHTML = '';
                if(data.data.length === 0) {
                    grid.innerHTML = '<p style="grid-column: 1 / -1;">Nenhuma foto na galeria.</p>';
                    return;
                }
                
                data.data.forEach(foto => {
                    const fotoPath = safeImagePath(foto.url_imagem);
                    grid.innerHTML += `
                        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="height: 150px; background-image: url('../${escapeAttr(fotoPath)}'); background-size: cover; background-position: center;"></div>
                            <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px; flex: 1;">
                                <input type="text" class="form-control" style="font-size: 0.85rem; padding: 6px;" placeholder="Sem legenda" value="${escapeAttr(foto.legenda || '')}" onchange="window.updatePhotoLegenda(${safeInt(foto.id)}, this.value)">
                                <button class="btn" style="padding: 6px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 6px; font-size: 0.8rem; margin-top: auto;" onclick="window.deleteGalleryPhoto(${safeInt(foto.id)})">Excluir</button>
                            </div>
                        </div>
                    `;
                });
            }
        } catch(e) {
            console.error('Erro ao carregar galeria', e);
            grid.innerHTML = '<p>Erro ao carregar.</p>';
        }
    }

    window.uploadGalleryPhoto = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            // Usa a própria api/gallery.php para upload de galeria (pois cria o registro no bd tb)
            const res = await fetch('api/gallery.php?action=create', {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData
            });
            const result = await res.json();
            if(result.success) {
                loadGallery();
            } else {
                alert(result.error || 'Erro ao enviar foto');
            }
        } catch(err) {
            console.error(err);
        }
    };

    window.updatePhotoLegenda = async (id, legenda) => {
        try {
            const formData = new FormData();
            formData.append('legenda', legenda);
            await fetch(`api/gallery.php?action=update_legenda&id=${safeInt(id)}`, {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData
            });
        } catch(err) {
            console.error(err);
        }
    };

    window.deleteGalleryPhoto = async (id) => {
        if(!confirm('Tem certeza que deseja excluir esta foto da galeria?')) return;
        
        try {
            const res = await fetch(`api/gallery.php?action=delete&id=${safeInt(id)}`, {
                method: 'DELETE',
                headers: csrfHeaders()
            });
            const result = await res.json();
            if(result.success) {
                loadGallery();
            } else {
                alert(result.error || 'Erro ao deletar foto');
            }
        } catch(err) {
            console.error(err);
        }
    };

    // Initial load
    loadDashboardStats();

    // Event Listeners for New Buttons
    document.getElementById('btn-new-category').addEventListener('click', () => {
        openModal('Nova Categoria', `
            <form id="form-category" onsubmit="window.saveCategory(event)">
                <div class="form-group">
                    <label>Nome da Categoria</label>
                    <input type="text" class="form-control" name="nome" required>
                </div>
                <div class="form-group">
                    <label>Tipo de Aplicação</label>
                    <select class="form-control" name="tipo_aplicacao">
                        <option value="item">Estabelecimento/Serviço</option>
                        <option value="evento">Evento</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Salvar</button>
            </form>
        `);
    });

    document.getElementById('btn-new-item').addEventListener('click', async () => {
        try {
            const catRes = await fetch('api/categories.php?action=list');
            const catData = await catRes.json();
            let catOptions = '<option value="">Selecione...</option>';
            if(catData.data) {
                catData.data.forEach(c => {
                    catOptions += `<option value="${safeInt(c.id)}">${escapeHtml(c.nome)} (${escapeHtml(c.tipo_aplicacao)})</option>`;
                });
            }
            openModal('Novo Estabelecimento/Serviço', getItemFormHTML(null, catOptions));
        } catch(e) {}
    });

    document.getElementById('btn-new-event').addEventListener('click', async () => {
        try {
            const catRes = await fetch('api/categories.php?action=list');
            const catData = await catRes.json();
            let catOptions = '<option value="">Sem Categoria</option>';
            if(catData.data) {
                catData.data.forEach(c => {
                    if (c.tipo_aplicacao === 'evento') {
                        catOptions += `<option value="${safeInt(c.id)}">${escapeHtml(c.nome)}</option>`;
                    }
                });
            }
            openModal('Novo Evento', getEventFormHTML(null, catOptions));
        } catch(e) { console.error(e); }
    });
});
