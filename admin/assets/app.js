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
    const isCheckedValue = (value) => value === true || value === 1 || value === '1';
    const safeImagePath = (value) => {
        const normalized = String(value ?? '').trim().replace(/^\.?\//, '');
        return /^(uploads|assets)\/[A-Za-z0-9._/-]+\.(jpe?g|png|webp|gif)$/i.test(normalized) ? normalized : '';
    };
    function appendCacheBuster(url, attempt) {
        const separator = String(url).includes('?') ? '&' : '?';
        return `${url}${separator}_=${Date.now()}-${attempt}`;
    }

    async function fetchJson(url, options = {}, retryJsonFetch = true) {
        const method = String(options.method || 'GET').toUpperCase();
        const attempts = method === 'GET' && retryJsonFetch ? 2 : 1;
        let lastError = null;

        for (let attempt = 0; attempt < attempts; attempt += 1) {
            const requestUrl = method === 'GET' ? appendCacheBuster(url, attempt) : url;
            const response = await fetch(requestUrl, {
                ...options,
                method,
                cache: 'no-store',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    ...(options.headers || {}),
                },
            });
            const responseText = await response.text();

            try {
                return responseText === '' ? null : JSON.parse(responseText);
            } catch (err) {
                const preview = responseText
                    .slice(0, 180)
                    .replace(/\s+/g, ' ')
                    .trim();
                lastError = new Error(`Resposta JSON invalida em ${url} (HTTP ${response.status}): ${preview || 'resposta vazia'}`);
                lastError.cause = err;
            }
        }

        throw lastError || new Error(`Falha ao carregar JSON em ${url}`);
    }

    function normalizeCategorySlug(value) {
        return String(value ?? '')
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const PRIMARY_ITEM_CATEGORY_SLUGS = ['onde-ficar', 'onde-comer', 'servicos', 'experiencias'];
    const ITEM_CONTEXTS = {
        hospedagens: {
            key: 'hospedagens',
            categorySlug: 'onde-ficar',
            title: 'Hospedagens',
            subtitle: 'Gerencie hospedagens cadastradas no site',
            newLabel: 'Nova hospedagem',
            createTitle: 'Nova Hospedagem',
            editTitle: 'Editar Hospedagem',
            titleLabel: 'Nome da hospedagem',
            titlePlaceholder: 'Ex: Pousada Poesia',
            subtitleLabel: 'Tipo / diferencial',
            subtitlePlaceholder: 'Ex: Pousada familiar, camping, hospedagem rural',
            descriptionLabel: 'Descricao da hospedagem',
            descriptionPlaceholder: 'Descreva a hospedagem, estrutura, diferenciais e informacoes importantes para o visitante.',
            addressLabel: 'Endereco da hospedagem',
            addressPlaceholder: 'Ex: Rua Principal, zona rural, Pancas - ES',
            mapLabel: 'Link do mapa da hospedagem',
            phoneLabel: 'Contato da hospedagem',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: pousadapoesia ou https://instagram.com/pousadapoesia',
            websiteLabel: 'Website oficial',
            websitePlaceholder: 'Ex: https://www.pousadapoesia.com.br',
            hoursLabel: 'Horario de atendimento',
            hoursPlaceholder: 'Ex: Seg-Dom: 08:00 as 20:00',
            filtersLabel: 'Tipo de hospedagem',
            filtersHint: 'Selecione os filtros que melhor classificam esta hospedagem.',
            imageLabel: 'Foto de capa da hospedagem',
            activeLabel: 'Hospedagem ativa no site',
            saveLabel: 'Salvar hospedagem',
            emptyText: 'Nenhuma hospedagem cadastrada.',
        },
        gastronomia: {
            key: 'gastronomia',
            categorySlug: 'onde-comer',
            title: 'Gastronomia',
            subtitle: 'Gerencie restaurantes, lanchonetes e opcoes de alimentacao',
            newLabel: 'Novo estabelecimento',
            createTitle: 'Novo Estabelecimento de Gastronomia',
            editTitle: 'Editar Gastronomia',
            titleLabel: 'Nome do estabelecimento',
            titlePlaceholder: 'Ex: Restaurante Vista dos Pontoes',
            subtitleLabel: 'Especialidade / tipo de cozinha',
            subtitlePlaceholder: 'Ex: Comida caseira, cafeteria, lanchonete',
            descriptionLabel: 'Descricao do estabelecimento',
            descriptionPlaceholder: 'Descreva o estabelecimento, cardapio, especialidades e informacoes importantes.',
            addressLabel: 'Endereco do estabelecimento',
            addressPlaceholder: 'Ex: Avenida principal, Centro, Pancas - ES',
            mapLabel: 'Link do mapa do estabelecimento',
            phoneLabel: 'Contato do estabelecimento',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: restaurantepancas ou https://instagram.com/restaurantepancas',
            websiteLabel: 'Site ou cardapio',
            websitePlaceholder: 'Ex: https://www.restaurante.com.br/cardapio',
            hoursLabel: 'Horario de funcionamento',
            hoursPlaceholder: 'Ex: Ter-Dom: 11:00 as 14:00, 18:00 as 22:00',
            filtersLabel: 'Filtros de gastronomia',
            filtersHint: 'Selecione momentos de refeicao e tipo do estabelecimento.',
            imageLabel: 'Foto de capa do estabelecimento',
            activeLabel: 'Estabelecimento ativo no site',
            saveLabel: 'Salvar estabelecimento',
            emptyText: 'Nenhum estabelecimento de gastronomia cadastrado.',
        },
        servicos: {
            key: 'servicos',
            categorySlug: 'servicos',
            title: 'Serviços',
            subtitle: 'Gerencie servicos locais uteis ao visitante',
            newLabel: 'Novo serviço',
            createTitle: 'Novo Serviço',
            editTitle: 'Editar Serviço',
            titleLabel: 'Nome do serviço/empresa',
            titlePlaceholder: 'Ex: Condutor Turistico Pancas',
            subtitleLabel: 'Tipo de serviço',
            subtitlePlaceholder: 'Ex: Condutor turistico, imobiliaria, materiais de construcao',
            descriptionLabel: 'Descricao do servico',
            descriptionPlaceholder: 'Descreva o servico, atendimento, diferenciais e informacoes importantes.',
            addressLabel: 'Endereco ou area de atendimento',
            addressPlaceholder: 'Ex: Centro, Pancas - ES ou atendimento em toda a regiao',
            mapLabel: 'Link do mapa do servico',
            phoneLabel: 'Contato do servico',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: guia.pancas ou https://instagram.com/guia.pancas',
            websiteLabel: 'Site do servico',
            websitePlaceholder: 'Ex: https://www.servico.com.br',
            hoursLabel: 'Horario de atendimento',
            hoursPlaceholder: 'Ex: Seg-Sex: 08:00 as 18:00',
            filtersLabel: 'Tipo de servico',
            filtersHint: 'Selecione o filtro que melhor descreve este servico.',
            imageLabel: 'Foto de capa do servico',
            activeLabel: 'Servico ativo no site',
            saveLabel: 'Salvar servico',
            emptyText: 'Nenhum serviço cadastrado.',
        },
        experiencias: {
            key: 'experiencias',
            categorySlug: 'experiencias',
            title: 'Experiências',
            subtitle: 'Gerencie experiencias e atrativos do O que Fazer',
            newLabel: 'Nova experiência',
            createTitle: 'Nova Experiência',
            editTitle: 'Editar Experiência',
            titleLabel: 'Nome da experiência',
            titlePlaceholder: 'Ex: Rota dos Pontões Capixabas',
            subtitleLabel: 'Tipo / destaque da experiência',
            subtitlePlaceholder: 'Ex: Trilha, voo livre, mirante, roteiro cultural',
            descriptionLabel: 'Descricao da experiencia',
            descriptionPlaceholder: 'Descreva a experiencia, nivel de dificuldade, duracao e orientacoes ao visitante.',
            addressLabel: 'Local ou ponto de encontro',
            addressPlaceholder: 'Ex: Entrada da trilha, comunidade local, Pancas - ES',
            mapLabel: 'Link do mapa da experiencia',
            phoneLabel: 'Contato da experiencia',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: aventura.pancas ou https://instagram.com/aventura.pancas',
            websiteLabel: 'Site ou informacoes',
            websitePlaceholder: 'Ex: https://www.experiencia.com.br',
            hoursLabel: 'Dias e horarios recomendados',
            hoursPlaceholder: 'Ex: Sab-Dom: 07:00 as 12:00',
            filtersLabel: 'Filtros da experiencia',
            filtersHint: 'Selecione filtros cadastrados para esta experiencia, quando houver.',
            imageLabel: 'Foto de capa da experiencia',
            activeLabel: 'Experiencia ativa no site',
            saveLabel: 'Salvar experiencia',
            emptyText: 'Nenhuma experiência cadastrada.',
        },
        outros: {
            key: 'outros',
            categorySlug: null,
            title: 'Outros itens',
            subtitle: 'Gerencie categorias adicionais de itens',
            newLabel: 'Novo item',
            createTitle: 'Novo Item',
            editTitle: 'Editar Item',
            titleLabel: 'Título',
            titlePlaceholder: 'Ex: Atrativo ou local de interesse',
            subtitleLabel: 'Resumo curto / especialidade',
            subtitlePlaceholder: 'Ex: Categoria, especialidade ou diferencial principal',
            descriptionLabel: 'Descricao do item',
            descriptionPlaceholder: 'Descreva o item, diferenciais e informacoes importantes para o visitante.',
            addressLabel: 'Endereco / Localizacao',
            addressPlaceholder: 'Ex: Avenida principal, Centro, Pancas - ES',
            mapLabel: 'Link do Google Maps',
            phoneLabel: 'Contato do item',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: perfil.pancas ou https://instagram.com/perfil.pancas',
            websiteLabel: 'Website',
            websitePlaceholder: 'Ex: https://www.site.com.br',
            hoursLabel: 'Horario de funcionamento',
            hoursPlaceholder: 'Ex: Seg-Sex: 08:00 as 12:00, 14:00 as 18:00',
            filtersLabel: 'Filtros',
            filtersHint: 'Os filtros mudam conforme a categoria selecionada.',
            imageLabel: 'Foto de capa do item',
            activeLabel: 'Item ativo no site',
            saveLabel: 'Salvar item',
            emptyText: 'Nenhum item adicional cadastrado.',
        },
    };
    const HOSTING_EXTRA_SCHEMA = {
        typeOptions: [
            { value: 'pousada', label: 'Pousada' },
            { value: 'hotel', label: 'Hotel' },
            { value: 'camping', label: 'Camping' },
            { value: 'chale', label: 'Chale' },
            { value: 'cama-e-cafe', label: 'Cama & Cafe' },
        ],
        priceOptions: [
            { value: 'economico', label: 'Economico $' },
            { value: 'intermediario', label: 'Intermediario $$' },
            { value: 'luxo', label: 'Luxo $$$' },
        ],
        amenityOptions: [
            { value: 'wifi', label: 'Wi-Fi' },
            { value: 'estacionamento', label: 'Estacionamento' },
            { value: 'ar-condicionado', label: 'Ar-condicionado' },
            { value: 'piscina', label: 'Piscina' },
            { value: 'cozinha-equipada', label: 'Cozinha equipada' },
            { value: 'acessibilidade', label: 'Acessibilidade' },
        ],
    };
    const GASTRONOMY_EXTRA_SCHEMA = {
        cuisineOptions: [
            { value: 'caseira', label: 'Caseira' },
            { value: 'brasileira', label: 'Brasileira' },
            { value: 'cafeteria', label: 'Cafeteria' },
            { value: 'lanchonete', label: 'Lanchonete' },
            { value: 'pizzaria', label: 'Pizzaria' },
            { value: 'bar', label: 'Bar' },
            { value: 'outros', label: 'Outros' },
        ],
        priceOptions: [
            { value: 'economico', label: 'Economico $' },
            { value: 'intermediario', label: 'Intermediario $$' },
            { value: 'alto', label: 'Alto $$$' },
        ],
        mealOptions: [
            { value: 'cafe-da-manha', label: 'Cafe da manha' },
            { value: 'almoco', label: 'Almoco' },
            { value: 'lanches', label: 'Lanches' },
            { value: 'jantar', label: 'Jantar' },
        ],
        serviceOptions: [
            { value: 'consumo-local', label: 'Consumo no local' },
            { value: 'delivery', label: 'Delivery' },
            { value: 'retirada', label: 'Retirada' },
        ],
        paymentOptions: [
            { value: 'pix', label: 'Pix' },
            { value: 'cartao', label: 'Cartao' },
            { value: 'dinheiro', label: 'Dinheiro' },
        ],
    };
    const SERVICES_EXTRA_SCHEMA = {
        typeOptions: [
            { value: 'condutor-turistico', label: 'Condutor turistico' },
            { value: 'imobiliaria', label: 'Imobiliaria' },
            { value: 'materiais-construcao', label: 'Materiais de construcao' },
            { value: 'transporte', label: 'Transporte' },
            { value: 'comercio-local', label: 'Comercio local' },
            { value: 'saude', label: 'Saude' },
            { value: 'oficina', label: 'Oficina' },
            { value: 'outros', label: 'Outros' },
        ],
        areaOptions: [
            { value: 'pancas', label: 'Pancas' },
            { value: 'regiao', label: 'Regiao' },
            { value: 'online', label: 'Online' },
            { value: 'domicilio', label: 'Atendimento em domicilio' },
        ],
        attendanceOptions: [
            { value: 'presencial', label: 'Presencial' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'delivery', label: 'Delivery' },
            { value: 'agendamento', label: 'Com agendamento' },
        ],
        paymentOptions: [
            { value: 'pix', label: 'Pix' },
            { value: 'cartao', label: 'Cartao' },
            { value: 'dinheiro', label: 'Dinheiro' },
        ],
    };
    const EXPERIENCES_EXTRA_SCHEMA = {
        typeOptions: [
            { value: 'trilha', label: 'Trilha' },
            { value: 'voo-livre', label: 'Voo livre' },
            { value: 'mirante', label: 'Mirante' },
            { value: 'roteiro-cultural', label: 'Roteiro cultural' },
            { value: 'turismo-rural', label: 'Turismo rural' },
            { value: 'aventura', label: 'Aventura' },
            { value: 'contemplacao', label: 'Contemplacao' },
            { value: 'outros', label: 'Outros' },
        ],
        difficultyOptions: [
            { value: 'facil', label: 'Facil' },
            { value: 'moderado', label: 'Moderado' },
            { value: 'dificil', label: 'Dificil' },
        ],
        audienceOptions: [
            { value: 'familias', label: 'Familias' },
            { value: 'criancas', label: 'Criancas' },
            { value: 'casais', label: 'Casais' },
            { value: 'grupos', label: 'Grupos' },
            { value: 'aventureiros', label: 'Aventureiros' },
        ],
        structureOptions: [
            { value: 'guia', label: 'Guia' },
            { value: 'estacionamento', label: 'Estacionamento' },
            { value: 'banheiro', label: 'Banheiro' },
            { value: 'alimentacao', label: 'Alimentacao' },
            { value: 'sinalizacao', label: 'Sinalizacao' },
            { value: 'acessibilidade', label: 'Acessibilidade' },
        ],
    };
    let currentItemContextKey = 'hospedagens';
    let lastItemCategories = [];
    const itemSortState = {
        key: 'criado_em',
        direction: 'desc',
    };
    function showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.append(container);
        }

        const toast = document.createElement('div');
        const toastTypeClass = type === 'error' ? 'toast--error' : 'toast--success';
        toast.className = `toast ${toastTypeClass}`;
        toast.setAttribute('role', 'status');

        const icon = document.createElement('span');
        icon.className = 'toast__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = type === 'error' ? '!' : '';

        const text = document.createElement('span');
        text.className = 'toast__text';
        text.textContent = message || (type === 'error' ? 'Nao foi possivel concluir a acao.' : 'Acao concluida.');

        toast.append(icon, text);
        container.append(toast);

        window.setTimeout(() => {
            toast.classList.add('toast--leaving');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, 4000);
    }
    const WEEK_DAYS = [
        { key: 'seg', short: 'Seg', display: 'Seg.', label: 'Segunda-feira' },
        { key: 'ter', short: 'Ter', display: 'Ter.', label: 'Terca-feira' },
        { key: 'qua', short: 'Qua', display: 'Qua.', label: 'Quarta-feira' },
        { key: 'qui', short: 'Qui', display: 'Qui.', label: 'Quinta-feira' },
        { key: 'sex', short: 'Sex', display: 'Sex.', label: 'Sexta-feira' },
        { key: 'sab', short: 'Sab', display: 'Sab.', label: 'Sabado' },
        { key: 'dom', short: 'Dom', display: 'Dom.', label: 'Domingo' },
    ];
    const DAY_TOKEN_INDEX = {
        seg: 0,
        segunda: 0,
        ter: 1,
        terca: 1,
        qua: 2,
        quarta: 2,
        qui: 3,
        quinta: 3,
        sex: 4,
        sexta: 4,
        sab: 5,
        sabado: 5,
        dom: 6,
        domingo: 6,
    };
    let filterOptionsCache = null;

    async function loadFilterOptions() {
        if (filterOptionsCache !== null) {
            return filterOptionsCache;
        }

        try {
            const data = await fetchJson('api/filters.php?action=list');
            filterOptionsCache = data.success && Array.isArray(data.data) ? data.data : [];
        } catch (err) {
            console.error('Erro ao carregar filtros', err);
            filterOptionsCache = [];
        }

        return filterOptionsCache;
    }

    function splitFilterSlugs(value) {
        return String(value ?? '')
            .split(',')
            .map((slug) => slug.trim())
            .filter(Boolean);
    }

    function getCurrentItemContext() {
        return ITEM_CONTEXTS[currentItemContextKey] || ITEM_CONTEXTS.hospedagens;
    }

    function isOtherItemsContext(context = getCurrentItemContext()) {
        return context.key === 'outros';
    }

    function isPrimaryItemCategorySlug(slug) {
        return PRIMARY_ITEM_CATEGORY_SLUGS.includes(normalizeCategorySlug(slug));
    }

    function normalizeItemCategories(categories) {
        return (categories || []).filter((category) => category.tipo_aplicacao === 'item');
    }

    function getContextCategory(categories, context = getCurrentItemContext()) {
        if (isOtherItemsContext(context)) {
            return null;
        }

        return normalizeItemCategories(categories).find((category) => normalizeCategorySlug(category.slug) === context.categorySlug) || null;
    }

    function getOtherItemCategories(categories) {
        return normalizeItemCategories(categories).filter((category) => !isPrimaryItemCategorySlug(category.slug));
    }

    function filterItemsForContext(items, context = getCurrentItemContext()) {
        return (items || []).filter((item) => {
            const categorySlug = normalizeCategorySlug(item.categoria_slug);
            if (isOtherItemsContext(context)) {
                return !isPrimaryItemCategorySlug(categorySlug);
            }

            return categorySlug === context.categorySlug;
        });
    }

    function getItemsListUrl(context = getCurrentItemContext()) {
        return `api/items.php?action=list&context=${encodeURIComponent(context.key)}`;
    }

    function getItemContextForItem(item) {
        const categorySlug = normalizeCategorySlug(item?.categoria_slug);
        return Object.values(ITEM_CONTEXTS).find((context) => context.categorySlug === categorySlug) || ITEM_CONTEXTS.outros;
    }

    function normalizeSortText(value) {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function getItemSortValue(item, key) {
        if (key === 'ativo') {
            return isCheckedValue(item?.ativo) ? 1 : 0;
        }

        if (key === 'criado_em') {
            return new Date(item?.criado_em || 0).getTime() || 0;
        }

        return normalizeSortText(item?.[key]);
    }

    function sortItemsForTable(items) {
        const directionFactor = itemSortState.direction === 'desc' ? -1 : 1;

        return [...(items || [])].sort((a, b) => {
            const aValue = getItemSortValue(a, itemSortState.key);
            const bValue = getItemSortValue(b, itemSortState.key);

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * directionFactor;
            }

            return String(aValue).localeCompare(String(bValue), 'pt-BR') * directionFactor;
        });
    }

    function updateItemSortButtons() {
        document.querySelectorAll('[data-item-sort-key]').forEach((button) => {
            const isActive = button.dataset.itemSortKey === itemSortState.key;
            button.classList.toggle('active', isActive);
            button.classList.toggle('is-desc', isActive && itemSortState.direction === 'desc');
            button.setAttribute('aria-sort', isActive ? (itemSortState.direction === 'desc' ? 'descending' : 'ascending') : 'none');
        });
    }

    function setItemSort(key) {
        if (!key) {
            return;
        }

        if (itemSortState.key === key) {
            itemSortState.direction = itemSortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            itemSortState.key = key;
            itemSortState.direction = key === 'ativo' ? 'desc' : 'asc';
        }

        updateItemSortButtons();
        loadItems();
    }

    function setupItemSorting() {
        const itemTable = document.getElementById('items-tbody')?.closest('table');
        const headers = itemTable ? Array.from(itemTable.querySelectorAll('thead th')) : [];
        const sortableHeaders = [
            { index: 1, key: 'titulo' },
            { index: 2, key: 'categoria_nome' },
            { index: 3, key: 'ativo' },
        ];

        sortableHeaders.forEach(({ index, key }) => {
            const header = headers[index];
            const control = header?.querySelector('[data-item-sort-key]') || header?.querySelector('div') || header;
            if (!control || control.dataset.itemSortReady === '1') {
                return;
            }

            control.dataset.itemSortKey = key;
            control.dataset.itemSortReady = '1';
            control.classList.add('table-sort');
            control.setAttribute('role', 'button');
            control.setAttribute('tabindex', '0');
            control.setAttribute('aria-sort', 'none');
            control.addEventListener('click', () => setItemSort(key));
            control.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setItemSort(key);
                }
            });
        });

        updateItemSortButtons();
    }

    async function loadItemCategories() {
        const catData = await fetchJson('api/categories.php?action=list');
        lastItemCategories = normalizeItemCategories(catData.data || []);
        return lastItemCategories;
    }

    function applyItemContextHeader(context = getCurrentItemContext(), options = {}) {
        const title = document.getElementById('item-context-title');
        const subtitle = document.getElementById('item-context-subtitle');
        const button = document.getElementById('btn-new-item');

        if (title) {
            title.textContent = context.title;
        }

        if (subtitle) {
            subtitle.textContent = options.message || context.subtitle;
        }

        if (button) {
            button.textContent = context.newLabel;
            button.disabled = Boolean(options.disableCreate);
            button.title = options.disableCreate ? (options.message || '') : '';
        }
    }

    function stripAccents(value) {
        return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function normalizeOpeningDayToken(value) {
        return stripAccents(value)
            .toLowerCase()
            .replace(/-?feira/g, '')
            .replace(/\./g, '')
            .replace(/\s+/g, '')
            .trim();
    }

    function dayIndexFromToken(token) {
        const normalizedToken = normalizeOpeningDayToken(token);
        return Object.prototype.hasOwnProperty.call(DAY_TOKEN_INDEX, normalizedToken)
            ? DAY_TOKEN_INDEX[normalizedToken]
            : null;
    }

    function expandOpeningDays(dayText) {
        const normalizedText = stripAccents(dayText)
            .toLowerCase()
            .replace(/-?feira/g, '')
            .replace(/\./g, '')
            .replace(/\s+/g, ' ')
            .trim();
        const rangeParts = normalizedText.split(/\s*(?:-| a | ate )\s*/).filter(Boolean);

        if (rangeParts.length === 2) {
            const startIndex = dayIndexFromToken(rangeParts[0]);
            const endIndex = dayIndexFromToken(rangeParts[1]);
            if (startIndex !== null && endIndex !== null && startIndex <= endIndex) {
                return WEEK_DAYS.slice(startIndex, endIndex + 1).map((_, index) => startIndex + index);
            }
        }

        return normalizedText
            .split(/\s*(?:,|\/| e )\s*/)
            .map(dayIndexFromToken)
            .filter((index) => index !== null);
    }

    function normalizeOpeningTime(value) {
        const match = String(value ?? '')
            .trim()
            .toLowerCase()
            .match(/^(\d{1,2})(?::?(\d{2})|h(\d{0,2}))?$/);

        if (!match) {
            return '';
        }

        const hour = Number.parseInt(match[1], 10);
        const minute = Number.parseInt(match[2] || match[3] || '0', 10);

        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            return '';
        }

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    function extractOpeningPeriods(scheduleText) {
        const matches = String(scheduleText ?? '').match(/\b\d{1,2}(?::\d{2}|h\d{0,2})?\b/gi) || [];
        const times = matches.map(normalizeOpeningTime).filter(Boolean);
        const periods = [];

        for (let index = 0; index < times.length && periods.length < 2; index += 2) {
            if (times[index] && times[index + 1]) {
                periods.push({ start: times[index], end: times[index + 1] });
            }
        }

        return periods;
    }

    function createOpeningHoursBlockData() {
        return {
            startDay: '',
            endDay: '',
            ranges: [
                { start: '', end: '' },
                { start: '', end: '' },
            ],
        };
    }

    function parseOpeningHoursValue(value) {
        const blocks = [];
        const parts = String(value ?? '')
            .split(/\s*(?:\||\n|;)\s*/)
            .map((part) => part.trim())
            .filter(Boolean);

        parts.forEach((part) => {
            const separatorIndex = part.indexOf(':');
            if (separatorIndex === -1) {
                return;
            }

            const dayText = part.slice(0, separatorIndex).trim();
            const scheduleText = part.slice(separatorIndex + 1).trim();
            if (/fechado|fecha|nao abre|nao atende|não abre|não atende/i.test(scheduleText)) {
                return;
            }

            const dayIndexes = expandOpeningDays(dayText);
            const periods = extractOpeningPeriods(scheduleText);
            if (dayIndexes.length === 0 || periods.length === 0) {
                return;
            }

            const block = createOpeningHoursBlockData();
            block.startDay = String(dayIndexes[0]);
            block.endDay = dayIndexes.length > 1 ? String(dayIndexes[dayIndexes.length - 1]) : '';
            periods.forEach((period, index) => {
                block.ranges[index] = { ...period };
            });
            blocks.push(block);
        });

        return blocks;
    }

    function setSelectOptions(select, options, selectedValue, placeholder) {
        select.innerHTML = '';

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = placeholder;
        select.append(emptyOption);

        options.forEach((option) => {
            const item = document.createElement('option');
            item.value = String(option.value);
            item.textContent = option.label;
            select.append(item);
        });

        select.value = options.some((option) => String(option.value) === String(selectedValue))
            ? String(selectedValue)
            : '';
    }

    function getOpeningHoursBlocks(container) {
        return Array.from(container.querySelectorAll('.opening-hours__block'));
    }

    function getOpeningBlockRange(block) {
        const startValue = block.querySelector('.opening-hours__day-start')?.value || '';
        const endValue = block.querySelector('.opening-hours__day-end')?.value || '';
        if (startValue === '') {
            return null;
        }

        const start = Number.parseInt(startValue, 10);
        const end = endValue === '' ? start : Number.parseInt(endValue, 10);
        if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
            return null;
        }

        return { start, end };
    }

    function getOpeningRangeIndexes(start, end) {
        const indexes = [];
        for (let index = start; index <= end; index += 1) {
            indexes.push(index);
        }
        return indexes;
    }

    function getUsedOpeningDayIndexes(container, ignoredBlock = null) {
        const used = new Set();
        getOpeningHoursBlocks(container).forEach((block) => {
            if (block === ignoredBlock) {
                return;
            }

            const range = getOpeningBlockRange(block);
            if (!range) {
                return;
            }

            getOpeningRangeIndexes(range.start, range.end).forEach((index) => used.add(index));
        });

        return used;
    }

    function hasOpeningHoursConflict(block, container) {
        const range = getOpeningBlockRange(block);
        if (!range) {
            return false;
        }

        const used = getUsedOpeningDayIndexes(container, block);
        return getOpeningRangeIndexes(range.start, range.end).some((index) => used.has(index));
    }

    function getAvailableOpeningStartIndexes(container, block = null) {
        const used = getUsedOpeningDayIndexes(container, block);
        return WEEK_DAYS
            .map((_, index) => index)
            .filter((index) => !used.has(index));
    }

    function updateOpeningHoursAddState(container) {
        const button = container.querySelector('[data-opening-action="add-block"]');
        const notice = container.querySelector('.opening-hours__notice');
        const blocks = getOpeningHoursBlocks(container);
        const hasEmptyBlock = blocks.some((block) => !getOpeningBlockRange(block));
        const hasAvailableDays = getAvailableOpeningStartIndexes(container).length > 0;

        if (button) {
            button.disabled = hasEmptyBlock || !hasAvailableDays;
        }

        if (notice) {
            notice.hidden = hasAvailableDays;
        }
    }

    function updateOpeningHoursDayOptions(container) {
        getOpeningHoursBlocks(container).forEach((block) => {
            const startSelect = block.querySelector('.opening-hours__day-start');
            const endSelect = block.querySelector('.opening-hours__day-end');
            const startValue = startSelect?.dataset.pendingValue || startSelect?.value || '';
            const endValue = endSelect?.dataset.pendingValue || endSelect?.value || '';
            const availableStarts = getAvailableOpeningStartIndexes(container, block)
                .map((index) => ({ value: index, label: WEEK_DAYS[index].display || WEEK_DAYS[index].short }));

            setSelectOptions(startSelect, availableStarts, startValue, 'Dia');
            delete startSelect.dataset.pendingValue;

            const selectedStart = startSelect.value === '' ? null : Number.parseInt(startSelect.value, 10);
            if (selectedStart === null || Number.isNaN(selectedStart)) {
                setSelectOptions(endSelect, [], '', 'Até');
                endSelect.disabled = true;
                return;
            }

            const used = getUsedOpeningDayIndexes(container, block);
            const endOptions = [];
            for (let index = selectedStart + 1; index < WEEK_DAYS.length; index += 1) {
                const rangeHasConflict = getOpeningRangeIndexes(selectedStart, index).some((dayIndex) => used.has(dayIndex));
                if (!rangeHasConflict) {
                    endOptions.push({ value: index, label: WEEK_DAYS[index].display || WEEK_DAYS[index].short });
                }
            }

            setSelectOptions(endSelect, endOptions, endValue, 'Mesmo dia');
            delete endSelect.dataset.pendingValue;
            endSelect.disabled = false;
        });

        updateOpeningHoursAddState(container);
    }

    function createOpeningHoursDaySelect(className, label) {
        const select = document.createElement('select');
        select.className = `form-control ${className}`;
        select.setAttribute('aria-label', label);
        return select;
    }

    function createOpeningHoursTimeInput(value, label) {
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.className = 'form-control opening-hours__time';
        timeInput.value = value || '';
        timeInput.setAttribute('aria-label', label);
        return timeInput;
    }

    function createOpeningHoursRange(rangeIndex, range = {}) {
        const row = document.createElement('div');
        row.className = 'opening-hours__range';
        row.dataset.rangeIndex = String(rangeIndex);

        const fromText = document.createElement('span');
        fromText.className = 'opening-hours__range-label';
        fromText.textContent = 'de';

        const startInput = createOpeningHoursTimeInput(range.start, 'Horario inicial');
        startInput.dataset.timeRole = 'start';
        startInput.dataset.rangeIndex = String(rangeIndex);

        const toText = document.createElement('span');
        toText.className = 'opening-hours__range-label';
        toText.textContent = 'às';

        const endInput = createOpeningHoursTimeInput(range.end, 'Horario final');
        endInput.dataset.timeRole = 'end';
        endInput.dataset.rangeIndex = String(rangeIndex);

        row.append(fromText, startInput, toText, endInput);
        return row;
    }

    function createOpeningHoursBlock(blockData = createOpeningHoursBlockData()) {
        const block = document.createElement('div');
        block.className = 'opening-hours__block';

        const header = document.createElement('div');
        header.className = 'opening-hours__block-header';

        const dayRange = document.createElement('div');
        dayRange.className = 'opening-hours__day-range';

        const startSelect = createOpeningHoursDaySelect('opening-hours__day-start', 'Dia inicial');
        startSelect.dataset.pendingValue = blockData.startDay || '';

        const dash = document.createElement('span');
        dash.className = 'opening-hours__day-separator';
        dash.textContent = '-';

        const endSelect = createOpeningHoursDaySelect('opening-hours__day-end', 'Dia final');
        endSelect.dataset.pendingValue = blockData.endDay || '';

        dayRange.append(startSelect, dash, endSelect);

        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'opening-hours__clear';
        clearButton.dataset.openingAction = 'clear-block';
        clearButton.setAttribute('aria-label', 'Limpar bloco');
        clearButton.title = 'Limpar bloco';
        clearButton.textContent = '×';

        header.append(dayRange, clearButton);

        const ranges = document.createElement('div');
        ranges.className = 'opening-hours__ranges';
        ranges.append(createOpeningHoursRange(0, blockData.ranges?.[0] || {}));
        ranges.append(createOpeningHoursRange(1, blockData.ranges?.[1] || {}));

        block.append(header, ranges);
        return block;
    }

    function serializeOpeningHoursBlocks(form) {
        const lines = [];
        form.querySelectorAll('.opening-hours__block').forEach((block) => {
            const range = getOpeningBlockRange(block);
            if (!range) {
                return;
            }

            const dayText = range.end > range.start
                ? `${WEEK_DAYS[range.start].short}-${WEEK_DAYS[range.end].short}`
                : WEEK_DAYS[range.start].short;
            const ranges = Array.from(block.querySelectorAll('.opening-hours__range'))
                .map((rangeElement) => {
                    const start = rangeElement.querySelector('[data-time-role="start"]')?.value || '';
                    const end = rangeElement.querySelector('[data-time-role="end"]')?.value || '';
                    return start && end ? `${start} às ${end}` : '';
                })
                .filter(Boolean);

            if (ranges.length > 0) {
                lines.push(`${dayText}: ${ranges.join(', ')}`);
            }
        });

        return lines.join(' | ');
    }

    function validateOpeningHours(form) {
        const container = form.querySelector('#opening-hours');
        const used = new Set();

        for (const block of form.querySelectorAll('.opening-hours__block')) {
            const range = getOpeningBlockRange(block);
            const filledRanges = Array.from(block.querySelectorAll('.opening-hours__range')).filter((rangeElement) => {
                const start = rangeElement.querySelector('[data-time-role="start"]')?.value || '';
                const end = rangeElement.querySelector('[data-time-role="end"]')?.value || '';
                return start || end;
            });

            if (!range && filledRanges.length === 0) {
                continue;
            }

            if (!range) {
                alert('Selecione o dia inicial do bloco de horário.');
                return false;
            }

            const firstStart = block.querySelector('[data-range-index="0"][data-time-role="start"]')?.value || '';
            const firstEnd = block.querySelector('[data-range-index="0"][data-time-role="end"]')?.value || '';
            if (!firstStart || !firstEnd) {
                alert('Preencha o primeiro intervalo do bloco de horário.');
                return false;
            }

            for (const rangeElement of block.querySelectorAll('.opening-hours__range')) {
                const start = rangeElement.querySelector('[data-time-role="start"]')?.value || '';
                const end = rangeElement.querySelector('[data-time-role="end"]')?.value || '';
                if ((start && !end) || (!start && end)) {
                    alert('Preencha o horário inicial e final do intervalo.');
                    return false;
                }

                if (start && end && start >= end) {
                    alert('O horário final deve ser depois do horário inicial.');
                    return false;
                }
            }

            if (hasOpeningHoursConflict(block, container)) {
                alert('Existe conflito entre os dias cadastrados nos blocos de horário.');
                return false;
            }

            for (const index of getOpeningRangeIndexes(range.start, range.end)) {
                if (used.has(index)) {
                    alert('Existe conflito entre os dias cadastrados nos blocos de horário.');
                    return false;
                }
                used.add(index);
            }
        }

        return true;
    }

    function syncOpeningHoursField(form, validate = false) {
        const textarea = form?.querySelector('textarea[name="horario_funcionamento"]');
        const container = form?.querySelector('#opening-hours');
        if (!textarea || !container) {
            return true;
        }

        if (container.dataset.touched !== '1') {
            return true;
        }

        if (validate && !validateOpeningHours(form)) {
            return false;
        }

        textarea.value = serializeOpeningHoursBlocks(form);
        return true;
    }

    function markOpeningHoursTouched(form) {
        const container = form?.querySelector('#opening-hours');
        if (container) {
            container.dataset.touched = '1';
        }
    }

    function enhanceOpeningHoursField() {
        const form = document.getElementById('form-item');
        const textarea = form ? form.querySelector('textarea[name="horario_funcionamento"]') : null;
        if (!textarea || form.querySelector('#opening-hours')) {
            return;
        }

        const context = getItemFormContext(form);
        const group = textarea.closest('.form-group');
        const label = group ? group.querySelector('label') : null;
        if (label) {
            label.textContent = context.hoursLabel;
        }

        const parsedBlocks = parseOpeningHoursValue(textarea.value);
        textarea.hidden = true;
        textarea.classList.remove('form-control');
        textarea.classList.add('opening-hours__source');
        textarea.placeholder = context.hoursPlaceholder;

        const container = document.createElement('div');
        container.className = 'opening-hours';
        container.id = 'opening-hours';
        container.dataset.touched = '0';

        const blocks = document.createElement('div');
        blocks.className = 'opening-hours__blocks';
        (parsedBlocks.length > 0 ? parsedBlocks : [createOpeningHoursBlockData()]).forEach((blockData) => {
            blocks.append(createOpeningHoursBlock(blockData));
        });

        const footer = document.createElement('div');
        footer.className = 'opening-hours__footer';

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'opening-hours__add';
        addButton.dataset.openingAction = 'add-block';
        addButton.textContent = 'Adicionar horário';

        const notice = document.createElement('small');
        notice.className = 'opening-hours__notice';
        notice.hidden = true;
        notice.textContent = 'Todos os dias disponiveis ja foram cadastrados.';

        footer.append(addButton, notice);
        container.append(blocks, footer);

        container.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-opening-action]');
            if (!actionButton) {
                return;
            }

            if (actionButton.dataset.openingAction === 'add-block') {
                const availableDays = getAvailableOpeningStartIndexes(container);
                if (availableDays.length > 0) {
                    blocks.append(createOpeningHoursBlock(createOpeningHoursBlockData()));
                    updateOpeningHoursDayOptions(container);
                }
            }

            if (actionButton.dataset.openingAction === 'clear-block') {
                const block = actionButton.closest('.opening-hours__block');
                if (block) {
                    block.querySelectorAll('select, input[type="time"]').forEach((control) => {
                        control.value = '';
                    });
                    updateOpeningHoursDayOptions(container);
                }
            }

            markOpeningHoursTouched(form);
            syncOpeningHoursField(form, false);
        });

        container.addEventListener('change', (event) => {
            if (
                event.target.classList.contains('opening-hours__day-start') ||
                event.target.classList.contains('opening-hours__day-end')
            ) {
                updateOpeningHoursDayOptions(container);
            }

            markOpeningHoursTouched(form);
            syncOpeningHoursField(form, false);
        });

        container.addEventListener('input', () => {
            markOpeningHoursTouched(form);
            syncOpeningHoursField(form, false);
        });

        updateOpeningHoursDayOptions(container);
        textarea.before(container);
    }

    function getItemFormContext(form) {
        return ITEM_CONTEXTS[form?.dataset?.itemContext] || getCurrentItemContext();
    }

    function getItemCategorySlug(form) {
        const fixedSlug = normalizeCategorySlug(form?.dataset?.categorySlug || form?.querySelector('input[name="categoria_id"]')?.dataset?.categorySlug || '');
        if (fixedSlug) {
            return fixedSlug;
        }

        const select = form?.querySelector('select[name="categoria_id"]');
        const selectedOption = select?.selectedOptions?.[0];
        return normalizeCategorySlug(selectedOption?.dataset?.slug || '');
    }

    function getFilterOptionsForCategory(categorySlug) {
        const normalizedCategorySlug = normalizeCategorySlug(categorySlug);
        if (!normalizedCategorySlug) {
            return [];
        }

        return (filterOptionsCache || []).filter((option) => {
            const optionCategory = normalizeCategorySlug(option.categoria_slug);
            return optionCategory === normalizedCategorySlug;
        });
    }

    function renderFilterCheckboxes(container, selectedValue, categorySlug) {
        const selectedSlugs = new Set(splitFilterSlugs(selectedValue));
        const groups = new Map();
        const optionsByCategory = getFilterOptionsForCategory(categorySlug);

        container.innerHTML = '';

        if (!categorySlug) {
            const empty = document.createElement('p');
            empty.className = 'filter-checklist__empty';
            empty.textContent = 'Selecione uma categoria para ver os filtros disponiveis.';
            container.append(empty);
            return;
        }

        optionsByCategory.forEach((option) => {
            const groupName = option.grupo || 'Outros';
            if (!groups.has(groupName)) {
                groups.set(groupName, []);
            }

            groups.get(groupName).push(option);
        });

        if (groups.size === 0) {
            const empty = document.createElement('p');
            empty.className = 'filter-checklist__empty';
            empty.textContent = 'Nenhum filtro cadastrado para esta categoria.';
            container.append(empty);
            return;
        }

        Array.from(groups.entries()).forEach(([groupName, options]) => {
            const group = document.createElement('div');
            group.className = 'filter-checklist__group';

            const title = document.createElement('p');
            title.className = 'filter-checklist__group-title';
            title.textContent = groupName;
            group.append(title);

            options.forEach((option) => {
                const label = document.createElement('label');
                label.className = 'filter-checklist__option';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'filter-checklist__input';
                checkbox.value = option.slug;
                checkbox.checked = selectedSlugs.has(option.slug);

                const box = document.createElement('span');
                box.className = 'filter-checklist__box';
                box.setAttribute('aria-hidden', 'true');

                const name = document.createElement('span');
                name.className = 'filter-checklist__name';
                name.textContent = option.nome;

                label.append(checkbox, box, name);
                group.append(label);
            });

            container.append(group);
        });
    }

    function getSelectedFilterSlugs(form) {
        const checkboxes = form.querySelectorAll('.filter-checklist__input:checked');
        if (checkboxes.length === 0 && !form.querySelector('#item-filters')) {
            return splitFilterSlugs(form.elements.filtros?.value);
        }

        return Array.from(checkboxes)
            .map((checkbox) => checkbox.value)
            .filter(Boolean);
    }

    function enhanceItemFilterField(selectedValue) {
        const form = document.getElementById('form-item');
        const input = form ? form.querySelector('input[name="filtros"]') : null;
        if (!input) {
            return;
        }

        const context = getItemFormContext(form);
        const group = input.closest('.form-group');
        if (context.key === 'hospedagens' || context.key === 'gastronomia' || context.key === 'servicos' || context.key === 'experiencias') {
            input.type = 'hidden';
            input.id = 'item-filters-hidden';
            input.value = selectedValue || input.value || '';
            input.classList.remove('form-control');
            if (group) {
                group.hidden = true;
            }
            return;
        }

        const label = group ? group.querySelector('label') : null;
        if (label) {
            label.textContent = context.filtersLabel;
        }

        input.type = 'hidden';
        input.id = 'item-filters-hidden';
        input.value = selectedValue || input.value || '';
        input.removeAttribute('placeholder');
        input.classList.remove('form-control');

        const categorySelect = form.querySelector('select[name="categoria_id"]');
        const checklist = document.createElement('div');
        checklist.className = 'filter-checklist';
        checklist.id = 'item-filters';
        renderFilterCheckboxes(checklist, input.value, getItemCategorySlug(form));

        const hint = document.createElement('small');
        hint.className = 'filter-checklist__hint';
        hint.textContent = context.filtersHint;

        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                input.value = getSelectedFilterSlugs(form).join(', ');
                renderFilterCheckboxes(checklist, input.value, getItemCategorySlug(form));
            });
        }

        input.before(checklist);
        input.after(hint);
    }

    // SPA Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const itemContext = item.getAttribute('data-item-context');
            if (itemContext && ITEM_CONTEXTS[itemContext]) {
                currentItemContextKey = itemContext;
            }

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
    let modalInitialFormState = '';

    function getModalFormSnapshot(form) {
        if (!form) {
            return '';
        }

        return Array.from(form.elements)
            .map((field) => {
                const key = field.name || field.id || field.type || field.tagName;

                if (field.type === 'file') {
                    const fileNames = Array.from(field.files || []).map((file) => file.name).join(',');
                    return `${key}=files:${fileNames}`;
                }

                if (field.type === 'checkbox' || field.type === 'radio') {
                    return `${key}=checked:${field.checked ? '1' : '0'}:${field.value}`;
                }

                return `${key}=value:${field.value ?? ''}`;
            })
            .join('&');
    }

    function getActiveModalForm() {
        return modalOverlay?.querySelector('form') || null;
    }

    function markModalFormPristine() {
        modalInitialFormState = getModalFormSnapshot(getActiveModalForm());
    }

    function isFormDirty() {
        const form = getActiveModalForm();
        if (!form || !modalInitialFormState) {
            return false;
        }

        return getModalFormSnapshot(form) !== modalInitialFormState;
    }

    function clearItemImage(button) {
        const form = button?.closest('form');
        const hiddenInput = form?.querySelector('#imagem_capa_hidden');
        const fileInput = form?.querySelector('#item-image');
        const status = form?.querySelector('[data-image-status="item"]');

        if (!hiddenInput) {
            return;
        }

        hiddenInput.value = '';
        if (fileInput) {
            fileInput.value = '';
        }
        if (status) {
            status.textContent = 'Imagem removida. Salve para confirmar a alteracao.';
        }
        button.hidden = true;
    }

    function openModal(title, contentHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHtml;
        modalOverlay.classList.remove('hidden');
        const itemForm = document.getElementById('form-item');
        if (itemForm) {
            enhanceItemFilterField(itemForm.elements.filtros?.value || '');
            enhanceOpeningHoursField();
        }
        markModalFormPristine();
    }

    function closeModal(options = {}) {
        if (!options.force && isFormDirty() && !confirm('Existem alteracoes nao salvas. Deseja fechar mesmo assim?')) {
            return false;
        }

        modalOverlay.classList.add('hidden');
        modalInitialFormState = '';
        return true;
    }

    function closeModalSafely() {
        closeModal();
    }

    btnCloseModal.addEventListener('click', closeModalSafely);
    modalOverlay.addEventListener('click', (event) => {
        const removeItemImageButton = event.target.closest('[data-image-action="remove-item-image"]');
        if (removeItemImageButton) {
            clearItemImage(removeItemImageButton);
            return;
        }

        if (event.target === modalOverlay) {
            closeModalSafely();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            closeModalSafely();
        }
    });

    // Global Functions for onClick events
    window.editCategory = async (id) => {
        try {
            const data = await fetchJson('api/categories.php?action=list');
            const cat = data.data.find(c => c.id == id);

            if(cat) {
                openModal('Editar Categoria', `
                    <form id="form-category-edit" onsubmit="window.saveCategory(event, ${safeInt(id)})">
                        <div class="form-group">
                            <label>Nome da Categoria</label>
                            <input type="text" class="form-control" name="nome" placeholder="Ex: Onde Comer, Onde Ficar, Serviços" value="${escapeAttr(cat.nome)}" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo de Aplicação</label>
                            <select class="form-control" name="tipo_aplicacao">
                                <option value="item" ${cat.tipo_aplicacao == 'item' ? 'selected' : ''}>Estabelecimento/Serviço</option>
                                <option value="evento" ${cat.tipo_aplicacao == 'evento' ? 'selected' : ''}>Evento</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Icone SVG (opcional)</label>
                            <textarea class="form-control" name="icone_svg" rows="4" placeholder="Cole o SVG completo">${cat.icone_svg ? escapeHtml(cat.icone_svg) : ''}</textarea>
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
            const result = await fetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify(data)
            }, false);

            if(result.success) {
                closeModal({ force: true });
                loadCategories();
                loadDashboardStats();
            } else {
                alert(result.error || 'Erro ao salvar categoria');
            }
        } catch(err) {
            console.error(err);
        }
    };

    function buildItemCategoryField(item, categories, context = getCurrentItemContext()) {
        if (!isOtherItemsContext(context)) {
            const category = getContextCategory(categories, context);
            if (!category) {
                return '';
            }

            return `<input type="hidden" name="categoria_id" value="${safeInt(category.id)}" data-category-slug="${escapeAttr(normalizeCategorySlug(category.slug || ''))}">`;
        }

        const selectedId = item ? safeInt(item.categoria_id) : 0;
        let options = '<option value="">Selecione uma categoria</option>';
        getOtherItemCategories(categories).forEach((category) => {
            options += `<option value="${safeInt(category.id)}" data-slug="${escapeAttr(normalizeCategorySlug(category.slug || ''))}" ${selectedId === safeInt(category.id) ? 'selected' : ''}>${escapeHtml(category.nome)}</option>`;
        });

        return `
                <div class="form-group">
                    <label>Categoria</label>
                    <select class="form-control" name="categoria_id">
                        ${options}
                    </select>
                </div>`;
    }

    function parseItemExtraData(item) {
        const value = item?.dados_extra;
        if (!value) {
            return {};
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            return value;
        }

        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            } catch (err) {
                console.warn('dados_extra invalido para item', item?.id || '', err);
            }
        }

        return {};
    }

    function normalizeHostingExtraValue(value) {
        return normalizeCategorySlug(value);
    }

    function isHostingExtraChecked(value) {
        return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
    }

    function renderHostingSelectOptions(options, selectedValue) {
        const selected = normalizeHostingExtraValue(selectedValue);
        return [
            '<option value="">Selecione</option>',
            ...options.map((option) => {
                const checked = option.value === selected ? 'selected' : '';
                return `<option value="${escapeAttr(option.value)}" ${checked}>${escapeHtml(option.label)}</option>`;
            }),
        ].join('');
    }

    function renderHostingAmenityOptions(selectedAmenities) {
        const selected = new Set(Array.isArray(selectedAmenities) ? selectedAmenities.map(normalizeHostingExtraValue) : []);

        return HOSTING_EXTRA_SCHEMA.amenityOptions.map((option) => `
            <label class="hosting-extra__option">
                <input type="checkbox" class="hosting-extra__checkbox" name="hosting_extra_comodidades" value="${escapeAttr(option.value)}" ${selected.has(option.value) ? 'checked' : ''}>
                <span class="hosting-extra__box" aria-hidden="true"></span>
                <span>${escapeHtml(option.label)}</span>
            </label>
        `).join('');
    }

    function renderHostingToggle(name, label, checked) {
        return `
            <label class="hosting-extra__toggle">
                <input type="checkbox" name="${escapeAttr(name)}" value="1" ${isHostingExtraChecked(checked) ? 'checked' : ''}>
                <span class="hosting-extra__switch" aria-hidden="true"></span>
                <span>${escapeHtml(label)}</span>
            </label>
        `;
    }

    function renderHostingExtraFields(item, context = getCurrentItemContext()) {
        if (context.key !== 'hospedagens') {
            return '';
        }

        const extra = parseItemExtraData(item);
        return `
            <section class="hosting-extra" data-extra-scope="hospedagens">
                <div class="hosting-extra__header">
                    <h3>Dados da hospedagem</h3>
                </div>
                <div class="hosting-extra__grid">
                    <div class="form-group">
                        <label>Tipo de Hospedagem</label>
                        <select class="form-control" name="hosting_extra_tipo_hospedagem">
                            ${renderHostingSelectOptions(HOSTING_EXTRA_SCHEMA.typeOptions, extra.tipo_hospedagem)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Faixa de Preco</label>
                        <select class="form-control" name="hosting_extra_faixa_preco">
                            ${renderHostingSelectOptions(HOSTING_EXTRA_SCHEMA.priceOptions, extra.faixa_preco)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Media de Diaria</label>
                        <input type="text" class="form-control" name="hosting_extra_media_diaria" placeholder="Ex: R$ 200,00" value="${escapeAttr(extra.media_diaria || '')}">
                    </div>
                    <div class="form-group">
                        <label>Link de Reserva</label>
                        <input type="url" class="form-control" name="hosting_extra_link_reserva" placeholder="Ex: https://www.booking.com/..." value="${escapeAttr(extra.link_reserva || '')}">
                    </div>
                    <div class="form-group hosting-extra__wide">
                        <label>Comodidades</label>
                        <div class="hosting-extra__options">
                            ${renderHostingAmenityOptions(extra.comodidades)}
                        </div>
                    </div>
                    <div class="form-group hosting-extra__wide">
                        <label>Diferenciais</label>
                        <div class="hosting-extra__toggles">
                            ${renderHostingToggle('hosting_extra_aceita_pets', 'Aceita Pets', extra.aceita_pets)}
                            ${renderHostingToggle('hosting_extra_cafe_manha_incluso', 'Cafe da manha incluso', extra.cafe_manha_incluso)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Check-in</label>
                        <input type="time" class="form-control" name="hosting_extra_checkin" value="${escapeAttr(extra.checkin || '')}">
                    </div>
                    <div class="form-group">
                        <label>Check-out</label>
                        <input type="time" class="form-control" name="hosting_extra_checkout" value="${escapeAttr(extra.checkout || '')}">
                    </div>
                    <div class="form-group hosting-extra__wide">
                        <label>Observacoes Uteis</label>
                        <textarea class="form-control" name="hosting_extra_observacoes_uteis" rows="3" placeholder="Ex: Confirmar disponibilidade pelo WhatsApp.">${escapeHtml(extra.observacoes_uteis || '')}</textarea>
                    </div>
                </div>
            </section>
        `;
    }

    function collectHostingExtraData(form) {
        const section = form.querySelector('[data-extra-scope="hospedagens"]');
        if (!section) {
            return null;
        }

        return {
            tipo_hospedagem: normalizeHostingExtraValue(section.querySelector('[name="hosting_extra_tipo_hospedagem"]')?.value || ''),
            faixa_preco: normalizeHostingExtraValue(section.querySelector('[name="hosting_extra_faixa_preco"]')?.value || ''),
            media_diaria: section.querySelector('[name="hosting_extra_media_diaria"]')?.value.trim() || '',
            comodidades: Array.from(section.querySelectorAll('[name="hosting_extra_comodidades"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            aceita_pets: section.querySelector('[name="hosting_extra_aceita_pets"]')?.checked || false,
            cafe_manha_incluso: section.querySelector('[name="hosting_extra_cafe_manha_incluso"]')?.checked || false,
            checkin: section.querySelector('[name="hosting_extra_checkin"]')?.value || '',
            checkout: section.querySelector('[name="hosting_extra_checkout"]')?.value || '',
            link_reserva: section.querySelector('[name="hosting_extra_link_reserva"]')?.value.trim() || '',
            observacoes_uteis: section.querySelector('[name="hosting_extra_observacoes_uteis"]')?.value.trim() || '',
        };
    }

    function syncHostingTypeFilter(tipoHospedagem, currentFilters = '') {
        const selectedType = normalizeHostingExtraValue(tipoHospedagem);
        const typeSlugs = new Set(HOSTING_EXTRA_SCHEMA.typeOptions.map((option) => option.value));
        const filters = splitFilterSlugs(currentFilters).filter((filter) => !typeSlugs.has(filter));

        if (selectedType) {
            filters.unshift(selectedType);
        }

        return Array.from(new Set(filters)).join(', ');
    }

    function renderGastronomySelectOptions(options, selectedValue) {
        return renderHostingSelectOptions(options, selectedValue);
    }

    function renderGastronomyCheckboxOptions(options, selectedValues, inputName) {
        const selected = new Set(Array.isArray(selectedValues) ? selectedValues.map(normalizeHostingExtraValue) : []);

        return options.map((option) => `
            <label class="gastronomy-extra__option">
                <input type="checkbox" class="gastronomy-extra__checkbox" name="${escapeAttr(inputName)}" value="${escapeAttr(option.value)}" ${selected.has(option.value) ? 'checked' : ''}>
                <span class="gastronomy-extra__box" aria-hidden="true"></span>
                <span>${escapeHtml(option.label)}</span>
            </label>
        `).join('');
    }

    function renderGastronomyToggle(name, label, checked) {
        return `
            <label class="gastronomy-extra__toggle">
                <input type="checkbox" name="${escapeAttr(name)}" value="1" ${isHostingExtraChecked(checked) ? 'checked' : ''}>
                <span class="gastronomy-extra__switch" aria-hidden="true"></span>
                <span>${escapeHtml(label)}</span>
            </label>
        `;
    }

    function renderGastronomyExtraFields(item, context = getCurrentItemContext()) {
        if (context.key !== 'gastronomia') {
            return '';
        }

        const extra = parseItemExtraData(item);
        return `
            <section class="gastronomy-extra" data-extra-scope="gastronomia">
                <div class="gastronomy-extra__header">
                    <h3>Dados de gastronomia</h3>
                </div>
                <div class="gastronomy-extra__grid">
                    <div class="form-group">
                        <label>Tipo de cozinha</label>
                        <select class="form-control" name="gastronomy_extra_tipo_cozinha">
                            ${renderGastronomySelectOptions(GASTRONOMY_EXTRA_SCHEMA.cuisineOptions, extra.tipo_cozinha)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Faixa de Preco</label>
                        <select class="form-control" name="gastronomy_extra_faixa_preco">
                            ${renderGastronomySelectOptions(GASTRONOMY_EXTRA_SCHEMA.priceOptions, extra.faixa_preco)}
                        </select>
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Refeicoes</label>
                        <div class="gastronomy-extra__options">
                            ${renderGastronomyCheckboxOptions(GASTRONOMY_EXTRA_SCHEMA.mealOptions, extra.refeicoes, 'gastronomy_extra_refeicoes')}
                        </div>
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Servicos</label>
                        <div class="gastronomy-extra__options">
                            ${renderGastronomyCheckboxOptions(GASTRONOMY_EXTRA_SCHEMA.serviceOptions, extra.servicos, 'gastronomy_extra_servicos')}
                        </div>
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Diferenciais</label>
                        <div class="gastronomy-extra__toggles">
                            ${renderGastronomyToggle('gastronomy_extra_aceita_reserva', 'Aceita reserva', extra.aceita_reserva)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Link do cardapio</label>
                        <input type="url" class="form-control" name="gastronomy_extra_link_cardapio" placeholder="Ex: https://www.restaurante.com.br/cardapio" value="${escapeAttr(extra.link_cardapio || '')}">
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Formas de pagamento</label>
                        <div class="gastronomy-extra__options">
                            ${renderGastronomyCheckboxOptions(GASTRONOMY_EXTRA_SCHEMA.paymentOptions, extra.formas_pagamento, 'gastronomy_extra_formas_pagamento')}
                        </div>
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Observacoes Uteis</label>
                        <textarea class="form-control" name="gastronomy_extra_observacoes_uteis" rows="3" placeholder="Ex: Atendimento por ordem de chegada aos domingos.">${escapeHtml(extra.observacoes_uteis || '')}</textarea>
                    </div>
                </div>
            </section>
        `;
    }

    function collectGastronomyExtraData(form) {
        const section = form.querySelector('[data-extra-scope="gastronomia"]');
        if (!section) {
            return null;
        }

        return {
            tipo_cozinha: normalizeHostingExtraValue(section.querySelector('[name="gastronomy_extra_tipo_cozinha"]')?.value || ''),
            faixa_preco: normalizeHostingExtraValue(section.querySelector('[name="gastronomy_extra_faixa_preco"]')?.value || ''),
            refeicoes: Array.from(section.querySelectorAll('[name="gastronomy_extra_refeicoes"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            servicos: Array.from(section.querySelectorAll('[name="gastronomy_extra_servicos"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            aceita_reserva: section.querySelector('[name="gastronomy_extra_aceita_reserva"]')?.checked || false,
            link_cardapio: section.querySelector('[name="gastronomy_extra_link_cardapio"]')?.value.trim() || '',
            formas_pagamento: Array.from(section.querySelectorAll('[name="gastronomy_extra_formas_pagamento"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            observacoes_uteis: section.querySelector('[name="gastronomy_extra_observacoes_uteis"]')?.value.trim() || '',
        };
    }

    function syncGastronomyFilters(extraData, currentFilters = '') {
        const selectedType = normalizeHostingExtraValue(extraData?.tipo_cozinha || '');
        const selectedMeals = Array.isArray(extraData?.refeicoes)
            ? extraData.refeicoes.map(normalizeHostingExtraValue).filter(Boolean)
            : [];
        const syncedSlugs = new Set([
            ...GASTRONOMY_EXTRA_SCHEMA.cuisineOptions.map((option) => option.value),
            ...GASTRONOMY_EXTRA_SCHEMA.mealOptions.map((option) => option.value),
        ]);
        const filters = splitFilterSlugs(currentFilters).filter((filter) => !syncedSlugs.has(filter));

        return Array.from(new Set([selectedType, ...selectedMeals, ...filters].filter(Boolean))).join(', ');
    }

    function renderServicesSelectOptions(options, selectedValue) {
        return renderHostingSelectOptions(options, selectedValue);
    }

    function renderServicesCheckboxOptions(options, selectedValues, inputName) {
        const selected = new Set(Array.isArray(selectedValues) ? selectedValues.map(normalizeHostingExtraValue) : []);

        return options.map((option) => `
            <label class="services-extra__option">
                <input type="checkbox" class="services-extra__checkbox" name="${escapeAttr(inputName)}" value="${escapeAttr(option.value)}" ${selected.has(option.value) ? 'checked' : ''}>
                <span class="services-extra__box" aria-hidden="true"></span>
                <span>${escapeHtml(option.label)}</span>
            </label>
        `).join('');
    }

    function renderServicesToggle(name, label, checked) {
        return `
            <label class="services-extra__toggle">
                <input type="checkbox" name="${escapeAttr(name)}" value="1" ${isHostingExtraChecked(checked) ? 'checked' : ''}>
                <span class="services-extra__switch" aria-hidden="true"></span>
                <span>${escapeHtml(label)}</span>
            </label>
        `;
    }

    function renderServicesExtraFields(item, context = getCurrentItemContext()) {
        if (context.key !== 'servicos') {
            return '';
        }

        const extra = parseItemExtraData(item);
        return `
            <section class="services-extra" data-extra-scope="servicos">
                <div class="services-extra__header">
                    <h3>Dados do servico</h3>
                </div>
                <div class="services-extra__grid">
                    <div class="form-group">
                        <label>Tipo de servico</label>
                        <select class="form-control" name="services_extra_tipo_servico">
                            ${renderServicesSelectOptions(SERVICES_EXTRA_SCHEMA.typeOptions, extra.tipo_servico)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Area de atendimento</label>
                        <select class="form-control" name="services_extra_area_atendimento">
                            ${renderServicesSelectOptions(SERVICES_EXTRA_SCHEMA.areaOptions, extra.area_atendimento)}
                        </select>
                    </div>
                    <div class="form-group services-extra__wide">
                        <label>Formas de atendimento</label>
                        <div class="services-extra__options">
                            ${renderServicesCheckboxOptions(SERVICES_EXTRA_SCHEMA.attendanceOptions, extra.formas_atendimento, 'services_extra_formas_atendimento')}
                        </div>
                    </div>
                    <div class="form-group services-extra__wide">
                        <label>Diferenciais</label>
                        <div class="services-extra__toggles">
                            ${renderServicesToggle('services_extra_aceita_agendamento', 'Aceita agendamento', extra.aceita_agendamento)}
                            ${renderServicesToggle('services_extra_atendimento_24h', 'Atendimento 24h', extra.atendimento_24h)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Link do servico</label>
                        <input type="url" class="form-control" name="services_extra_link_servico" placeholder="Ex: https://www.servico.com.br/agenda" value="${escapeAttr(extra.link_servico || '')}">
                    </div>
                    <div class="form-group services-extra__wide">
                        <label>Formas de pagamento</label>
                        <div class="services-extra__options">
                            ${renderServicesCheckboxOptions(SERVICES_EXTRA_SCHEMA.paymentOptions, extra.formas_pagamento, 'services_extra_formas_pagamento')}
                        </div>
                    </div>
                    <div class="form-group services-extra__wide">
                        <label>Observacoes Uteis</label>
                        <textarea class="form-control" name="services_extra_observacoes_uteis" rows="3" placeholder="Ex: Atendimento mediante agendamento pelo WhatsApp.">${escapeHtml(extra.observacoes_uteis || '')}</textarea>
                    </div>
                </div>
            </section>
        `;
    }

    function collectServicesExtraData(form) {
        const section = form.querySelector('[data-extra-scope="servicos"]');
        if (!section) {
            return null;
        }

        return {
            tipo_servico: normalizeHostingExtraValue(section.querySelector('[name="services_extra_tipo_servico"]')?.value || ''),
            area_atendimento: normalizeHostingExtraValue(section.querySelector('[name="services_extra_area_atendimento"]')?.value || ''),
            formas_atendimento: Array.from(section.querySelectorAll('[name="services_extra_formas_atendimento"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            aceita_agendamento: section.querySelector('[name="services_extra_aceita_agendamento"]')?.checked || false,
            atendimento_24h: section.querySelector('[name="services_extra_atendimento_24h"]')?.checked || false,
            link_servico: section.querySelector('[name="services_extra_link_servico"]')?.value.trim() || '',
            formas_pagamento: Array.from(section.querySelectorAll('[name="services_extra_formas_pagamento"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            observacoes_uteis: section.querySelector('[name="services_extra_observacoes_uteis"]')?.value.trim() || '',
        };
    }

    function syncServicesFilters(tipoServico, currentFilters = '') {
        const selectedType = normalizeHostingExtraValue(tipoServico);
        const typeSlugs = new Set(SERVICES_EXTRA_SCHEMA.typeOptions.map((option) => option.value));
        const filters = splitFilterSlugs(currentFilters).filter((filter) => !typeSlugs.has(filter));

        if (selectedType) {
            filters.unshift(selectedType);
        }

        return Array.from(new Set(filters)).join(', ');
    }

    function renderExperiencesSelectOptions(options, selectedValue) {
        return renderHostingSelectOptions(options, selectedValue);
    }

    function renderExperiencesCheckboxOptions(options, selectedValues, inputName) {
        const selected = new Set(Array.isArray(selectedValues) ? selectedValues.map(normalizeHostingExtraValue) : []);

        return options.map((option) => `
            <label class="experiences-extra__option">
                <input type="checkbox" class="experiences-extra__checkbox" name="${escapeAttr(inputName)}" value="${escapeAttr(option.value)}" ${selected.has(option.value) ? 'checked' : ''}>
                <span class="experiences-extra__box" aria-hidden="true"></span>
                <span>${escapeHtml(option.label)}</span>
            </label>
        `).join('');
    }

    function renderExperiencesToggle(name, label, checked) {
        return `
            <label class="experiences-extra__toggle">
                <input type="checkbox" name="${escapeAttr(name)}" value="1" ${isHostingExtraChecked(checked) ? 'checked' : ''}>
                <span class="experiences-extra__switch" aria-hidden="true"></span>
                <span>${escapeHtml(label)}</span>
            </label>
        `;
    }

    function renderExperiencesExtraFields(item, context = getCurrentItemContext()) {
        if (context.key !== 'experiencias') {
            return '';
        }

        const extra = parseItemExtraData(item);
        return `
            <section class="experiences-extra" data-extra-scope="experiencias">
                <div class="experiences-extra__header">
                    <h3>Dados da experiencia</h3>
                </div>
                <div class="experiences-extra__grid">
                    <div class="form-group">
                        <label>Tipo de experiencia</label>
                        <select class="form-control" name="experiences_extra_tipo_experiencia">
                            ${renderExperiencesSelectOptions(EXPERIENCES_EXTRA_SCHEMA.typeOptions, extra.tipo_experiencia)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nivel de dificuldade</label>
                        <select class="form-control" name="experiences_extra_nivel_dificuldade">
                            ${renderExperiencesSelectOptions(EXPERIENCES_EXTRA_SCHEMA.difficultyOptions, extra.nivel_dificuldade)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Duracao media</label>
                        <input type="text" class="form-control" name="experiences_extra_duracao_media" placeholder="Ex: 2 horas" value="${escapeAttr(extra.duracao_media || '')}">
                    </div>
                    <div class="form-group">
                        <label>Melhor periodo</label>
                        <input type="text" class="form-control" name="experiences_extra_melhor_periodo" placeholder="Ex: Manha, seca, fim de tarde" value="${escapeAttr(extra.melhor_periodo || '')}">
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Publico indicado</label>
                        <div class="experiences-extra__options">
                            ${renderExperiencesCheckboxOptions(EXPERIENCES_EXTRA_SCHEMA.audienceOptions, extra.publico_indicado, 'experiences_extra_publico_indicado')}
                        </div>
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Estrutura disponivel</label>
                        <div class="experiences-extra__options">
                            ${renderExperiencesCheckboxOptions(EXPERIENCES_EXTRA_SCHEMA.structureOptions, extra.estrutura_disponivel, 'experiences_extra_estrutura_disponivel')}
                        </div>
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Diferenciais</label>
                        <div class="experiences-extra__toggles">
                            ${renderExperiencesToggle('experiences_extra_agendamento_obrigatorio', 'Agendamento obrigatorio', extra.agendamento_obrigatorio)}
                            ${renderExperiencesToggle('experiences_extra_entrada_gratuita', 'Entrada gratuita', extra.entrada_gratuita)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Preco base</label>
                        <input type="text" class="form-control" name="experiences_extra_preco_base" placeholder="Ex: Gratuito ou R$ 50 por pessoa" value="${escapeAttr(extra.preco_base || '')}">
                    </div>
                    <div class="form-group">
                        <label>Link de informacoes</label>
                        <input type="url" class="form-control" name="experiences_extra_link_informacoes" placeholder="Ex: https://www.experiencia.com.br" value="${escapeAttr(extra.link_informacoes || '')}">
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Observacoes Uteis</label>
                        <textarea class="form-control" name="experiences_extra_observacoes_uteis" rows="3" placeholder="Ex: Levar agua, calcado fechado e protetor solar.">${escapeHtml(extra.observacoes_uteis || '')}</textarea>
                    </div>
                </div>
            </section>
        `;
    }

    function collectExperiencesExtraData(form) {
        const section = form.querySelector('[data-extra-scope="experiencias"]');
        if (!section) {
            return null;
        }

        return {
            tipo_experiencia: normalizeHostingExtraValue(section.querySelector('[name="experiences_extra_tipo_experiencia"]')?.value || ''),
            nivel_dificuldade: normalizeHostingExtraValue(section.querySelector('[name="experiences_extra_nivel_dificuldade"]')?.value || ''),
            duracao_media: section.querySelector('[name="experiences_extra_duracao_media"]')?.value.trim() || '',
            melhor_periodo: section.querySelector('[name="experiences_extra_melhor_periodo"]')?.value.trim() || '',
            publico_indicado: Array.from(section.querySelectorAll('[name="experiences_extra_publico_indicado"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            estrutura_disponivel: Array.from(section.querySelectorAll('[name="experiences_extra_estrutura_disponivel"]:checked'))
                .map((input) => normalizeHostingExtraValue(input.value))
                .filter(Boolean),
            agendamento_obrigatorio: section.querySelector('[name="experiences_extra_agendamento_obrigatorio"]')?.checked || false,
            entrada_gratuita: section.querySelector('[name="experiences_extra_entrada_gratuita"]')?.checked || false,
            preco_base: section.querySelector('[name="experiences_extra_preco_base"]')?.value.trim() || '',
            link_informacoes: section.querySelector('[name="experiences_extra_link_informacoes"]')?.value.trim() || '',
            observacoes_uteis: section.querySelector('[name="experiences_extra_observacoes_uteis"]')?.value.trim() || '',
        };
    }

    function syncExperiencesFilters(tipoExperiencia, currentFilters = '') {
        const selectedType = normalizeHostingExtraValue(tipoExperiencia);
        const typeSlugs = new Set(EXPERIENCES_EXTRA_SCHEMA.typeOptions.map((option) => option.value));
        const filters = splitFilterSlugs(currentFilters).filter((filter) => !typeSlugs.has(filter));

        if (selectedType) {
            filters.unshift(selectedType);
        }

        return Array.from(new Set(filters)).join(', ');
    }

    window.editItem = async (id) => {
        try {
            const data = await fetchJson(`api/items.php?action=get&id=${safeInt(id)}`);
            const item = data.data;

            if (!item) {
                alert('Item nao encontrado.');
                return;
            }

            const categories = await loadItemCategories();
            const context = getItemContextForItem(item);
            const categoryField = buildItemCategoryField(item, categories, context);
            if (!categoryField && !isOtherItemsContext(context)) {
                alert(`Categoria não encontrada: ${context.categorySlug}`);
                return;
            }

            await loadFilterOptions();
            openModal(context.editTitle, getItemFormHTML(item, categoryField, safeInt(id), context));
        } catch(e) { console.error(e); }
    };
    
    function getItemFormHTML(item, categoryFieldHtml, id = null, context = getCurrentItemContext()) {
        const categorySlug = isOtherItemsContext(context) ? '' : context.categorySlug;
        const currentImage = safeImagePath(item?.imagem_capa || '');
        return `
            <form id="form-item" data-item-context="${escapeAttr(context.key)}" data-category-slug="${escapeAttr(categorySlug || '')}" onsubmit="window.saveItem(event, ${id ? safeInt(id) : 'null'})">
                <div class="form-group">
                    <label>${escapeHtml(context.titleLabel)}</label>
                    <input type="text" class="form-control" name="titulo" placeholder="${escapeAttr(context.titlePlaceholder)}" value="${item ? escapeAttr(item.titulo) : ''}" required>
                </div>
                <div class="form-group">
                    <label>${escapeHtml(context.subtitleLabel)}</label>
                    <input type="text" class="form-control" name="subtitulo" placeholder="${escapeAttr(context.subtitlePlaceholder)}" value="${item ? escapeAttr(item.subtitulo) : ''}">
                </div>
                ${categoryFieldHtml}
                <div class="form-group">
                    <label>${escapeHtml(context.descriptionLabel)}</label>
                    <textarea class="form-control" name="descricao_completa" rows="5" placeholder="${escapeAttr(context.descriptionPlaceholder)}">${item ? escapeHtml(item.descricao_completa) : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>${escapeHtml(context.addressLabel)}</label>
                    <input type="text" class="form-control" name="endereco" placeholder="${escapeAttr(context.addressPlaceholder)}" value="${item ? escapeAttr(item.endereco) : ''}">
                </div>
                <div class="form-group">
                    <label>${escapeHtml(context.mapLabel)}</label>
                    <input type="url" class="form-control" name="link_google_maps" placeholder="Ex: https://maps.app.goo.gl/..." value="${item ? escapeAttr(item.link_google_maps) : ''}">
                </div>
                <div class="form-group">
                    <label>${escapeHtml(context.phoneLabel)}</label>
                    <input type="text" class="form-control" name="telefone_whatsapp" placeholder="${escapeAttr(context.phonePlaceholder)}" value="${item ? escapeAttr(item.telefone_whatsapp) : ''}">
                </div>
                <div class="form-group">
                    <label>Instagram</label>
                    <input type="text" class="form-control" name="instagram" placeholder="${escapeAttr(context.instagramPlaceholder)}" value="${item ? escapeAttr(item.instagram) : ''}">
                </div>
                <div class="form-group">
                    <label>${escapeHtml(context.websiteLabel)}</label>
                    <input type="url" class="form-control" name="website" placeholder="${escapeAttr(context.websitePlaceholder)}" value="${item ? escapeAttr(item.website) : ''}">
                </div>
                <div class="form-group">
                    <label>${escapeHtml(context.hoursLabel)}</label>
                    <textarea class="form-control" name="horario_funcionamento" rows="3" placeholder="${escapeAttr(context.hoursPlaceholder)}">${item ? escapeHtml(item.horario_funcionamento) : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>${escapeHtml(context.filtersLabel)}</label>
                    <input type="text" class="form-control" name="filtros" value="${item && item.filtros ? escapeAttr(item.filtros) : ''}" placeholder="${escapeAttr(context.filtersHint)}">
                </div>
                ${renderHostingExtraFields(item, context)}
                ${renderGastronomyExtraFields(item, context)}
                ${renderServicesExtraFields(item, context)}
                ${renderExperiencesExtraFields(item, context)}
                <div class="form-group">
                    <label>${escapeHtml(context.imageLabel)}</label>
                    <input type="file" class="form-control" id="item-image" accept="image/jpeg,image/png,image/webp">
                    <input type="hidden" name="imagem_capa" id="imagem_capa_hidden" value="${item ? escapeAttr(item.imagem_capa) : ''}">
                    ${currentImage ? `
                        <div class="image-control__current">
                            <small data-image-status="item">Imagem atual salva.</small>
                            <button type="button" class="image-control__remove" data-image-action="remove-item-image">Remover imagem atual</button>
                        </div>
                    ` : ''}
                </div>
                <input type="hidden" name="is_destaque" value="${item && isCheckedValue(item.is_destaque) ? '1' : ''}">
                <div class="form-group">
                    <label style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" name="ativo" value="1" ${!item || isCheckedValue(item.ativo) ? 'checked' : ''}>
                        ${escapeHtml(context.activeLabel)}
                    </label>
                </div>
                <button type="submit" class="btn btn-primary" id="btn-save-item" data-default-text="${escapeAttr(context.saveLabel)}" style="width:100%; justify-content:center;">${escapeHtml(context.saveLabel)}</button>
            </form>
        `;
    }

    window.saveItem = async (e, id = null) => {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('btn-save-item');
        const defaultButtonText = btn?.dataset?.defaultText || 'Salvar item';
        btn.textContent = 'Salvando...';
        btn.disabled = true;

        try {
            if (!syncOpeningHoursField(form, true)) {
                btn.textContent = defaultButtonText;
                btn.disabled = false;
                return;
            }

            // Check if there is an image to upload first
            const fileInput = document.getElementById('item-image');
            if(fileInput.files.length > 0) {
                const imgData = new FormData();
                imgData.append('image', fileInput.files[0]);
                
                const upResult = await fetchJson('api/upload.php', { method: 'POST', headers: csrfHeaders(), body: imgData }, false);
                if(upResult.success) {
                    document.getElementById('imagem_capa_hidden').value = upResult.data.url;
                } else {
                    showToast('Erro ao enviar imagem: ' + (upResult.error || 'upload invalido'), 'error');
                    btn.textContent = defaultButtonText;
                    btn.disabled = false;
                    return;
                }
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const context = getItemFormContext(form);
            // convert empty strings to null for DB
            if(!data.categoria_id) data.categoria_id = null;
            data.is_destaque = form.elements.is_destaque?.value || '';
            data.ativo = form.elements.ativo.checked ? '1' : '';
            data.filtros = getSelectedFilterSlugs(form).join(', ');
            if (context.key === 'hospedagens') {
                data.dados_extra = collectHostingExtraData(form);
                data.filtros = syncHostingTypeFilter(data.dados_extra.tipo_hospedagem, data.filtros);
            }
            if (context.key === 'gastronomia') {
                data.dados_extra = collectGastronomyExtraData(form);
                data.filtros = syncGastronomyFilters(data.dados_extra, data.filtros);
            }
            if (context.key === 'servicos') {
                data.dados_extra = collectServicesExtraData(form);
                data.filtros = syncServicesFilters(data.dados_extra.tipo_servico, data.filtros);
            }
            if (context.key === 'experiencias') {
                data.dados_extra = collectExperiencesExtraData(form);
                data.filtros = syncExperiencesFilters(data.dados_extra.tipo_experiencia, data.filtros);
            }
            
            const url = id ? `api/items.php?action=update&id=${id}` : 'api/items.php?action=create';
            const result = await fetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify(data)
            }, false);
            
            if(result.success) {
                closeModal({ force: true });
                showToast(result.message || (id ? 'Item atualizado.' : 'Item criado.'), 'success');
                loadItems();
                loadDashboardStats();
            } else {
                showToast(result.error || 'Erro ao salvar item.', 'error');
            }
        } catch(err) {
            console.error(err);
            showToast('Erro ao salvar item.', 'error');
        } finally {
            btn.textContent = defaultButtonText;
            btn.disabled = false;
        }
    };

    window.deleteItem = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) {
            return;
        }

        try {
            const result = await fetchJson(`api/items.php?action=delete&id=${safeInt(id)}`, {
                method: 'POST',
                headers: csrfHeaders()
            }, false);

            if (result.success) {
                showToast(result.message || 'Item excluido.', 'success');
                loadItems();
                loadDashboardStats();
            } else {
                showToast(result.error || 'Erro ao excluir item.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao excluir item.', 'error');
        }
    };

    // Load Dashboard Stats
    async function loadDashboardStats() {
        try {
            const [catData, itemStatsData] = await Promise.all([
                fetchJson('api/categories.php?action=list'),
                fetchJson('api/items.php?action=stats')
            ]);
            
            document.getElementById('stat-categories').textContent = catData.data ? catData.data.length : '--';
            document.getElementById('stat-items').textContent = itemStatsData.data ? itemStatsData.data.total : '--';
        } catch(e) {
            console.error('Erro ao carregar stats', e);
        }
    }

    // Load Categories
    async function loadCategories() {
        const tbody = document.getElementById('categories-tbody');
        tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
        
        try {
            const data = await fetchJson('api/categories.php?action=list');
            
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
        const context = getCurrentItemContext();
        applyItemContextHeader(context);
        
        try {
            const [data, categories] = await Promise.all([
                fetchJson(getItemsListUrl(context)),
                loadItemCategories(),
            ]);
            
            if (data.success && data.data) {
                const fixedCategory = getContextCategory(categories, context);
                const otherCategories = getOtherItemCategories(categories);

                if (!isOtherItemsContext(context) && !fixedCategory) {
                    const message = `Categoria não encontrada: ${context.categorySlug}`;
                    applyItemContextHeader(context, { disableCreate: true, message });
                    tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(message)}</td></tr>`;
                    return;
                }

                if (isOtherItemsContext(context) && otherCategories.length === 0) {
                    applyItemContextHeader(context, {
                        disableCreate: true,
                        message: 'Nenhuma categoria adicional de item foi encontrada.',
                    });
                } else {
                    applyItemContextHeader(context);
                }

                const visibleItems = sortItemsForTable(filterItemsForContext(data.data, context));
                tbody.innerHTML = '';
                if (visibleItems.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(context.emptyText)}</td></tr>`;
                    return;
                }

                visibleItems.forEach(item => {
                    tbody.innerHTML += `
                        <tr>
                            <td>
                                ${safeImagePath(item.imagem_capa) ? `<img src="../${escapeAttr(safeImagePath(item.imagem_capa))}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" alt="">` : '<div style="width:50px; height:50px; background:#333; border-radius:8px;"></div>'}
                            </td>
                            <td><strong>${escapeHtml(item.titulo)}</strong><br><small class="text-muted">${escapeHtml(item.endereco)}</small></td>
                            <td>${escapeHtml(item.categoria_nome || 'Sem Categoria')}</td>
                            <td><span class="status-badge ${item.ativo ? 'status-active' : ''}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn" style="padding: 6px 12px; background: rgba(255,255,255,0.1); border-radius: 6px;" onclick="editItem(${safeInt(item.id)})">Editar</button>
                                    <button class="btn btn-danger" style="padding: 6px 12px; border-radius: 6px;" onclick="deleteItem(${safeInt(item.id)})">Excluir</button>
                                </div>
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
            const data = await fetchJson('api/events.php?action=list');
            
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
            const data = await fetchJson('api/events.php?action=list');
            const ev = data.data.find(i => i.id == id);
            
            const catData = await fetchJson('api/categories.php?action=list');
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
                    <input type="text" class="form-control" name="titulo" placeholder="Ex: Pomer Fest" value="${ev ? escapeAttr(ev.titulo) : ''}" required>
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
                        <input type="datetime-local" class="form-control" name="data_inicio" placeholder="Data e hora de início" value="${startStr}" required>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>Data Fim</label>
                        <input type="datetime-local" class="form-control" name="data_fim" placeholder="Data e hora de término" value="${endStr}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Local (Nome)</label>
                    <input type="text" class="form-control" name="local_nome" placeholder="Ex: Praça Central de Pancas" value="${ev ? escapeAttr(ev.local_nome) : ''}">
                </div>
                <div class="form-group">
                    <label>Endereco</label>
                    <input type="text" class="form-control" name="endereco" placeholder="Ex: Centro, Pancas - ES" value="${ev ? escapeAttr(ev.endereco) : ''}">
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea class="form-control" name="descricao_completa" rows="3" placeholder="Descreva a programação, atrações, público indicado e informações importantes.">${ev ? escapeHtml(ev.descricao_completa) : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Organizador</label>
                    <input type="text" class="form-control" name="organizador" placeholder="Ex: Prefeitura de Pancas, ATURP, comunidade local" value="${ev ? escapeAttr(ev.organizador) : ''}">
                </div>
                <div class="form-group">
                    <label>Telefone de contato</label>
                    <input type="text" class="form-control" name="telefone_contato" placeholder="Ex: 5527999999999" value="${ev ? escapeAttr(ev.telefone_contato) : ''}">
                </div>
                <div class="form-group">
                    <label>Link de ingressos</label>
                    <input type="url" class="form-control" name="link_ingressos" placeholder="Ex: https://site.com/ingressos" value="${ev ? escapeAttr(ev.link_ingressos) : ''}">
                </div>
                <div class="form-group">
                    <label>Preco base</label>
                    <input type="text" class="form-control" name="preco_base" placeholder="Ex: Entrada gratuita - ou - A partir de R$ 20" value="${ev ? escapeAttr(ev.preco_base) : ''}">
                </div>
                <div class="form-group">
                    <label>Upload de Capa (JPG/PNG)</label>
                    <input type="file" class="form-control" id="event-image" accept="image/jpeg,image/png,image/webp">
                    <input type="hidden" name="imagem_capa" id="event_imagem_capa_hidden" value="${ev ? escapeAttr(ev.imagem_capa) : ''}">
                    ${ev && ev.imagem_capa ? `<small style="display:block; margin-top:8px;">Imagem atual salva.</small>` : ''}
                </div>
                <div class="form-group">
                    <label style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" name="is_destaque" value="1" ${ev && isCheckedValue(ev.is_destaque) ? 'checked' : ''}>
                        Marcar como destaque
                    </label>
                </div>
                <div class="form-group">
                    <label style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" name="ativo" value="1" ${!ev || isCheckedValue(ev.ativo) ? 'checked' : ''}>
                        Evento ativo
                    </label>
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
                
                const upResult = await fetchJson('api/upload.php', { method: 'POST', headers: csrfHeaders(), body: imgData }, false);
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
            data.is_destaque = form.elements.is_destaque.checked ? '1' : '';
            data.ativo = form.elements.ativo.checked ? '1' : '';
            
            const url = id ? `api/events.php?action=update&id=${id}` : 'api/events.php?action=create';
            const result = await fetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify(data)
            }, false);
            
            if(result.success) {
                closeModal({ force: true });
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
            const data = await fetchJson('api/gallery.php?action=list');
            
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
            const result = await fetchJson('api/gallery.php?action=create', {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData
            }, false);
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
            const result = await fetchJson(`api/gallery.php?action=delete&id=${safeInt(id)}`, {
                method: 'DELETE',
                headers: csrfHeaders()
            }, false);
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
    setupItemSorting();
    loadDashboardStats();

    // Event Listeners for New Buttons
    document.getElementById('btn-new-category').addEventListener('click', () => {
        openModal('Nova Categoria', `
            <form id="form-category" onsubmit="window.saveCategory(event)">
                <div class="form-group">
                    <label>Nome da Categoria</label>
                    <input type="text" class="form-control" name="nome" placeholder="Ex: Onde Comer, Onde Ficar, Eventos" required>
                </div>
                <div class="form-group">
                    <label>Tipo de Aplicação</label>
                    <select class="form-control" name="tipo_aplicacao">
                        <option value="item">Estabelecimento/Serviço</option>
                        <option value="evento">Evento</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Icone SVG (opcional)</label>
                    <textarea class="form-control" name="icone_svg" rows="4" placeholder="Cole o SVG completo"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Salvar</button>
            </form>
        `);
    });

    document.getElementById('btn-new-item').addEventListener('click', async () => {
        try {
            const context = getCurrentItemContext();
            const categories = await loadItemCategories();
            const categoryField = buildItemCategoryField(null, categories, context);
            if (!categoryField && !isOtherItemsContext(context)) {
                alert(`Categoria não encontrada: ${context.categorySlug}`);
                return;
            }

            if (isOtherItemsContext(context) && getOtherItemCategories(categories).length === 0) {
                alert('Nenhuma categoria adicional de item foi encontrada.');
                return;
            }

            await loadFilterOptions();
            openModal(context.createTitle, getItemFormHTML(null, categoryField, null, context));
        } catch(e) {}
    });

    document.getElementById('btn-new-event').addEventListener('click', async () => {
        try {
            const catData = await fetchJson('api/categories.php?action=list');
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
