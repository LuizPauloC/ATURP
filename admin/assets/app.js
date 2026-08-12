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
            descriptionLabel: 'Descrição da hospedagem',
            descriptionPlaceholder: 'Descreva a hospedagem, estrutura, diferenciais e informações importantes para o visitante.',
            addressLabel: 'Endereço da hospedagem',
            addressPlaceholder: 'Ex: Rua Principal, zona rural, Pancas - ES',
            mapLabel: 'Link do mapa da hospedagem',
            phoneLabel: 'Contato da hospedagem',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: pousadapoesia ou https://instagram.com/pousadapoesia',
            websiteLabel: 'Website oficial',
            websitePlaceholder: 'Ex: https://www.pousadapoesia.com.br',
            hoursLabel: 'Horário de atendimento',
            hoursPlaceholder: 'Ex: Seg-Dom: 08:00 às 20:00',
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
            subtitle: 'Gerencie restaurantes, lanchonetes e opções de alimentação',
            newLabel: 'Novo estabelecimento',
            createTitle: 'Novo Estabelecimento de Gastronomia',
            editTitle: 'Editar Gastronomia',
            titleLabel: 'Nome do estabelecimento',
            titlePlaceholder: 'Ex: Restaurante Vista dos Pontões',
            subtitleLabel: 'Especialidade / tipo de cozinha',
            subtitlePlaceholder: 'Ex: Comida caseira, cafeteria, lanchonete',
            descriptionLabel: 'Descrição do estabelecimento',
            descriptionPlaceholder: 'Descreva o estabelecimento, cardápio, especialidades e informações importantes.',
            addressLabel: 'Endereço do estabelecimento',
            addressPlaceholder: 'Ex: Avenida principal, Centro, Pancas - ES',
            mapLabel: 'Link do mapa do estabelecimento',
            phoneLabel: 'Contato do estabelecimento',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: restaurantepancas ou https://instagram.com/restaurantepancas',
            websiteLabel: 'Site ou cardápio',
            websitePlaceholder: 'Ex: https://www.restaurante.com.br/cardapio',
            hoursLabel: 'Horário de funcionamento',
            hoursPlaceholder: 'Ex: Ter-Dom: 11:00 às 14:00, 18:00 às 22:00',
            filtersLabel: 'Filtros de gastronomia',
            filtersHint: 'Selecione momentos de refeição e tipo do estabelecimento.',
            imageLabel: 'Foto de capa do estabelecimento',
            activeLabel: 'Estabelecimento ativo no site',
            saveLabel: 'Salvar estabelecimento',
            emptyText: 'Nenhum estabelecimento de gastronomia cadastrado.',
        },
        servicos: {
            key: 'servicos',
            categorySlug: 'servicos',
            title: 'Serviços',
            subtitle: 'Gerencie serviços locais úteis ao visitante',
            newLabel: 'Novo serviço',
            createTitle: 'Novo Serviço',
            editTitle: 'Editar Serviço',
            titleLabel: 'Nome do serviço/empresa',
            titlePlaceholder: 'Ex: Condutor Turístico Pancas',
            subtitleLabel: 'Tipo de serviço',
            subtitlePlaceholder: 'Ex: Condutor turístico, imobiliária, materiais de construção',
            descriptionLabel: 'Descrição do serviço',
            descriptionPlaceholder: 'Descreva o serviço, atendimento, diferenciais e informações importantes.',
            addressLabel: 'Endereço ou área de atendimento',
            addressPlaceholder: 'Ex: Centro, Pancas - ES ou atendimento em toda a região',
            mapLabel: 'Link do mapa do serviço',
            phoneLabel: 'Contato do serviço',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: guia.pancas ou https://instagram.com/guia.pancas',
            websiteLabel: 'Site do serviço',
            websitePlaceholder: 'Ex: https://www.servico.com.br',
            hoursLabel: 'Horário de atendimento',
            hoursPlaceholder: 'Ex: Seg-Sex: 08:00 às 18:00',
            filtersLabel: 'Tipo de serviço',
            filtersHint: 'Selecione o filtro que melhor descreve este serviço.',
            imageLabel: 'Foto de capa do serviço',
            activeLabel: 'Serviço ativo no site',
            saveLabel: 'Salvar serviço',
            emptyText: 'Nenhum serviço cadastrado.',
        },
        experiencias: {
            key: 'experiencias',
            categorySlug: 'experiencias',
            title: 'Experiências',
            subtitle: 'Gerencie experiências e atrativos cadastrados',
            newLabel: 'Nova experiência',
            createTitle: 'Nova Experiência',
            editTitle: 'Editar Experiência',
            titleLabel: 'Nome da experiência',
            titlePlaceholder: 'Ex: Rota dos Pontões Capixabas',
            subtitleLabel: 'Tipo / destaque da experiência',
            subtitlePlaceholder: 'Ex: Trilha, voo livre, mirante, roteiro cultural',
            descriptionLabel: 'Descrição da experiência',
            descriptionPlaceholder: 'Descreva a experiência, nível de dificuldade, duração e orientações ao visitante.',
            addressLabel: 'Local ou ponto de encontro',
            addressPlaceholder: 'Ex: Entrada da trilha, comunidade local, Pancas - ES',
            mapLabel: 'Link do mapa da experiência',
            phoneLabel: 'Contato da experiência',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: aventura.pancas ou https://instagram.com/aventura.pancas',
            websiteLabel: 'Site ou informações',
            websitePlaceholder: 'Ex: https://www.experiencia.com.br',
            hoursLabel: 'Dias e horários recomendados',
            hoursPlaceholder: 'Ex: Sab-Dom: 07:00 às 12:00',
            filtersLabel: 'Filtros da experiência',
            filtersHint: 'Selecione filtros cadastrados para esta experiência, quando houver.',
            imageLabel: 'Foto de capa da experiência',
            activeLabel: 'Experiência ativa no site',
            saveLabel: 'Salvar experiência',
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
            descriptionLabel: 'Descrição do item',
            descriptionPlaceholder: 'Descreva o item, diferenciais e informações importantes para o visitante.',
            addressLabel: 'Endereço / Localização',
            addressPlaceholder: 'Ex: Avenida principal, Centro, Pancas - ES',
            mapLabel: 'Link do Google Maps',
            phoneLabel: 'Contato do item',
            phonePlaceholder: 'Ex: 5527999999999 ou https://wa.me/5527999999999',
            instagramPlaceholder: 'Ex: perfil.pancas ou https://instagram.com/perfil.pancas',
            websiteLabel: 'Website',
            websitePlaceholder: 'Ex: https://www.site.com.br',
            hoursLabel: 'Horário de funcionamento',
            hoursPlaceholder: 'Ex: Seg-Sex: 08:00 às 12:00, 14:00 às 18:00',
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
            { value: 'chale', label: 'Chalé' },
            { value: 'cama-e-cafe', label: 'Cama & Café' },
        ],
        priceOptions: [
            { value: 'economico', label: 'Econômico $' },
            { value: 'intermediario', label: 'Intermediário $$' },
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
            { value: 'economico', label: 'Econômico $' },
            { value: 'intermediario', label: 'Intermediário $$' },
            { value: 'alto', label: 'Alto $$$' },
        ],
        mealOptions: [
            { value: 'cafe-da-manha', label: 'Café da manhã' },
            { value: 'almoco', label: 'Almoço' },
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
            { value: 'cartao', label: 'Cartão' },
            { value: 'dinheiro', label: 'Dinheiro' },
        ],
    };
    const SERVICES_EXTRA_SCHEMA = {
        typeOptions: [
            { value: 'condutor-turistico', label: 'Condutor turístico' },
            { value: 'imobiliaria', label: 'Imobiliária' },
            { value: 'materiais-construcao', label: 'Materiais de construção' },
            { value: 'transporte', label: 'Transporte' },
            { value: 'comercio-local', label: 'Comércio local' },
            { value: 'saude', label: 'Saúde' },
            { value: 'oficina', label: 'Oficina' },
            { value: 'outros', label: 'Outros' },
        ],
        areaOptions: [
            { value: 'pancas', label: 'Pancas' },
            { value: 'regiao', label: 'Região' },
            { value: 'online', label: 'Online' },
            { value: 'domicilio', label: 'Atendimento em domicílio' },
        ],
        attendanceOptions: [
            { value: 'presencial', label: 'Presencial' },
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'delivery', label: 'Delivery' },
            { value: 'agendamento', label: 'Com agendamento' },
        ],
        paymentOptions: [
            { value: 'pix', label: 'Pix' },
            { value: 'cartao', label: 'Cartão' },
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
            { value: 'contemplacao', label: 'Contemplação' },
            { value: 'outros', label: 'Outros' },
        ],
        difficultyOptions: [
            { value: 'facil', label: 'Fácil' },
            { value: 'moderado', label: 'Moderado' },
            { value: 'dificil', label: 'Difícil' },
        ],
        audienceOptions: [
            { value: 'familias', label: 'Famílias' },
            { value: 'criancas', label: 'Crianças' },
            { value: 'casais', label: 'Casais' },
            { value: 'grupos', label: 'Grupos' },
            { value: 'aventureiros', label: 'Aventureiros' },
        ],
        structureOptions: [
            { value: 'guia', label: 'Guia' },
            { value: 'estacionamento', label: 'Estacionamento' },
            { value: 'banheiro', label: 'Banheiro' },
            { value: 'alimentacao', label: 'Alimentação' },
            { value: 'sinalizacao', label: 'Sinalização' },
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
        text.textContent = message || (type === 'error' ? 'Não foi possível concluir a ação.' : 'Ação concluída.');

        toast.append(icon, text);
        container.append(toast);

        window.setTimeout(() => {
            toast.classList.add('toast--leaving');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, 4000);
    }

    function uploadErrorReasonLabel(reason = '') {
        const normalizedReason = String(reason)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        if (normalizedReason.includes('5 mb') || normalizedReason.includes('maior') || normalizedReason.includes('grande')) {
            return 'tamanho acima de 5 MB';
        }

        if (normalizedReason.includes('tipo') || normalizedReason.includes('formato')) {
            return 'formato inválido';
        }

        if (normalizedReason.includes('imagem invalida') || normalizedReason.includes('arquivo de imagem')) {
            return 'arquivo de imagem inválido';
        }

        if (normalizedReason.includes('upload')) {
            return 'falha no upload';
        }

        return 'arquivo incompatível';
    }

    function uploadErrorMessageFromSkipped(skipped = [], fallback = 'Erro ao enviar imagem.') {
        if (!Array.isArray(skipped) || skipped.length === 0) {
            return fallback;
        }

        const reasons = Array.from(new Set(skipped.map((item) => uploadErrorReasonLabel(item?.reason))));
        const reasonText = reasons.length === 1 ? reasons[0] : reasons.join(', ');
        return `${skipped.length} imagem(ns) ignorada(s): ${reasonText}.`;
    }

    function uploadErrorMessageFromApi(error, fallback = 'Erro ao enviar imagem.') {
        return error ? uploadErrorReasonLabel(error) + '.' : fallback;
    }
    const WEEK_DAYS = [
        { key: 'seg', short: 'Seg', display: 'Seg.', label: 'Segunda-feira' },
        { key: 'ter', short: 'Ter', display: 'Ter.', label: 'Terça-feira' },
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

    function findSchemaOptionLabel(options, value) {
        const normalizedValue = normalizeCategorySlug(value);
        if (!normalizedValue) {
            return '';
        }

        return (options || []).find((option) => option.value === normalizedValue)?.label || '';
    }

    function getItemTypeLabelForTable(item, context = getItemContextForItem(item)) {
        const extra = parseItemExtraData(item);
        if (context.key === 'hospedagens') {
            return findSchemaOptionLabel(HOSTING_EXTRA_SCHEMA.typeOptions, extra.tipo_hospedagem) || 'Sem tipo';
        }
        if (context.key === 'gastronomia') {
            return findSchemaOptionLabel(GASTRONOMY_EXTRA_SCHEMA.cuisineOptions, extra.tipo_cozinha) || 'Sem tipo';
        }
        if (context.key === 'servicos') {
            return findSchemaOptionLabel(SERVICES_EXTRA_SCHEMA.typeOptions, extra.tipo_servico) || 'Sem tipo';
        }
        if (context.key === 'experiencias') {
            return findSchemaOptionLabel(EXPERIENCES_EXTRA_SCHEMA.typeOptions, extra.tipo_experiencia) || 'Sem tipo';
        }

        return item?.categoria_nome || 'Sem categoria';
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

        if (key === 'tipo_item') {
            return normalizeSortText(getItemTypeLabelForTable(item, getCurrentItemContext()));
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
            { index: 2, key: 'tipo_item' },
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

        const startInput = createOpeningHoursTimeInput(range.start, 'Horário inicial');
        startInput.dataset.timeRole = 'start';
        startInput.dataset.rangeIndex = String(rangeIndex);

        const toText = document.createElement('span');
        toText.className = 'opening-hours__range-label';
        toText.textContent = 'às';

        const endInput = createOpeningHoursTimeInput(range.end, 'Horário final');
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
    const menuToggle = document.getElementById('admin-menu-toggle');
    const mobileMenuQuery = window.matchMedia('(max-width: 900px)');

    function setAdminMenuOpen(isOpen) {
        document.body.classList.toggle('admin-nav-open', isOpen);
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu do painel' : 'Abrir menu do painel');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            setAdminMenuOpen(!document.body.classList.contains('admin-nav-open'));
        });
    }

    mobileMenuQuery.addEventListener?.('change', (event) => {
        if (!event.matches) {
            setAdminMenuOpen(false);
        }
    });

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

            if (mobileMenuQuery.matches) {
                document.body.classList.remove('admin-nav-open');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Abrir menu do painel');
                }
            }
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
            status.textContent = 'Imagem removida. Salve para confirmar a alteração.';
        }
        button.hidden = true;
    }

    function entityPhotosApiUrl(action, params = {}) {
        const query = new URLSearchParams({ action, ...params });
        return `api/entity_photos.php?${query.toString()}`;
    }

    const ENTITY_PHOTOS_LIST_ENDPOINT = 'api/entity_photos.php?action=list';
    const ENTITY_PHOTOS_CREATE_ENDPOINT = 'api/entity_photos.php?action=create';
    const ENTITY_PHOTOS_SET_COVER_ENDPOINT = 'api/entity_photos.php?action=set_cover';
    const ENTITY_PHOTOS_REORDER_ENDPOINT = 'api/entity_photos.php?action=reorder';

    function renderEntityMediaManager(entityType, entityId, currentImage = '', title = 'Galeria de imagens') {
        const safeEntityId = safeInt(entityId);
        const safeCurrentImage = safeImagePath(currentImage);
        const mediaTitle = String(title || 'Galeria de imagens').replace(/^Foto de capa\b/i, 'Fotos');

        if (!safeEntityId) {
            return `
                <section class="entity-media" data-media-manager data-media-dropzone data-entity-type="${escapeAttr(entityType)}" data-entity-id="">
                    <div class="entity-media__header">
                        <h3>${escapeHtml(mediaTitle)}</h3>
                    </div>
                    <div class="entity-media__status">Salve este cadastro antes de gerenciar a galeria.</div>
                </section>
            `;
        }

        return `
            <section class="entity-media" data-media-manager data-media-dropzone data-entity-type="${escapeAttr(entityType)}" data-entity-id="${safeEntityId}">
                <div class="entity-media__header">
                    <h3>${escapeHtml(mediaTitle)}</h3>
                    <label class="entity-media__upload">
                        <span class="entity-media__upload-icon" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M304 112L192 112C183.2 112 176 119.2 176 128L176 512C176 520.8 183.2 528 192 528L448 528C456.8 528 464 520.8 464 512L464 272L376 272C336.2 272 304 239.8 304 200L304 112zM444.1 224L352 131.9L352 200C352 213.3 362.7 224 376 224L444.1 224zM128 128C128 92.7 156.7 64 192 64L325.5 64C342.5 64 358.8 70.7 370.8 82.7L493.3 205.3C505.3 217.3 512 233.6 512 250.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM387.4 496L252.6 496C236.8 496 224 483.2 224 467.4C224 461 226.1 454.9 230 449.8L297.6 362.9C303 356 311.3 352 320 352C328.7 352 337 356 342.4 362.9L410 449.9C413.9 454.9 416 461.1 416 467.5C416 483.3 403.2 496.1 387.4 496.1zM240 288C257.7 288 272 302.3 272 320C272 337.7 257.7 352 240 352C222.3 352 208 337.7 208 320C208 302.3 222.3 288 240 288z"/></svg>
                        </span>
                        <small>Adicionar imagem</small>
                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple data-media-action="upload">
                    </label>
                </div>
                <div class="entity-media__status" data-media-status>Carregando imagens...</div>
                <div class="entity-media__grid" data-media-grid></div>
            </section>
        `;
    }

    function normalizeEntityMediaImageKey(value) {
        return safeImagePath(value).replace(/^\.?\//, '');
    }

    function renderCurrentEntityCoverPreview(coverImage) {
        return `
            <article class="entity-media__thumb entity-media__thumb--legacy">
                <div class="entity-media__image" style="background-image:url('../${escapeAttr(coverImage)}')">
                    <span class="entity-media__cover-badge">Capa atual</span>
                </div>
            </article>
        `;
    }

    function renderEntityPhotos(manager, payload) {
        const grid = manager.querySelector('[data-media-grid]');
        const status = manager.querySelector('[data-media-status]');
        const hiddenInput = manager.closest('form')?.querySelector('[name="imagem_capa"]');
        const photos = Array.isArray(payload?.photos) ? payload.photos : [];
        const coverImage = safeImagePath(payload?.entity?.imagem_capa || '');
        const coverImageKey = normalizeEntityMediaImageKey(coverImage);

        if (hiddenInput) {
            hiddenInput.value = coverImage ? `./${coverImage}` : '';
        }

        if (!grid || !status) {
            return;
        }

        if (!photos.length) {
            if (coverImage) {
                status.textContent = 'Capa atual salva. Envie imagens para criar uma galeria editável.';
                grid.innerHTML = renderCurrentEntityCoverPreview(coverImage);
            } else {
                status.textContent = 'Nenhuma imagem cadastrada.';
                grid.innerHTML = '';
            }
            return;
        }

        const hasCoverInPhotos = coverImageKey !== '' && photos.some((photo) => (
            normalizeEntityMediaImageKey(photo.url_imagem) === coverImageKey
        ));
        const currentCoverPreviewMarkup = coverImage && !hasCoverInPhotos ? renderCurrentEntityCoverPreview(coverImage) : '';

        status.textContent = `${photos.length} imagem(ns) cadastrada(s).`;
        grid.innerHTML = currentCoverPreviewMarkup + photos.map((photo, index) => {
            const image = safeImagePath(photo.url_imagem);
            if (!image) {
                return '';
            }

            const photoId = safeInt(photo.id);
            return `
                <article class="entity-media__thumb" data-photo-id="${photoId}">
                    <div class="entity-media__image" style="background-image:url('../${escapeAttr(image)}')">
                        ${photo.is_cover ? '<span class="entity-media__cover-badge">Capa atual</span>' : ''}
                    </div>
                    <div class="entity-media__body">
                        <input type="text" class="form-control entity-media__caption-input" value="${escapeAttr(photo.legenda || '')}" placeholder="Legenda da imagem" data-media-action="caption" data-photo-id="${photoId}">
                        <div class="entity-media__actions">
                            <button type="button" class="entity-media__button entity-media__button--icon" data-media-action="move-up" data-photo-id="${photoId}" title="Subir imagem" aria-label="Subir imagem" ${index === 0 ? 'disabled' : ''}>
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M300.3 199.2C312.9 188.9 331.4 189.7 343.1 201.4L471.1 329.4C480.3 338.6 483 352.3 478 364.3C473 376.3 461.4 384 448.5 384L192.5 384C179.6 384 167.9 376.2 162.9 364.2C157.9 352.2 160.7 338.5 169.9 329.4L297.9 201.4L300.3 199.2z"/></svg>
                            </button>
                            <button type="button" class="entity-media__button entity-media__button--icon" data-media-action="move-down" data-photo-id="${photoId}" title="Descer imagem" aria-label="Descer imagem" ${index === photos.length - 1 ? 'disabled' : ''}>
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M300.3 440.8C312.9 451 331.4 450.3 343.1 438.6L471.1 310.6C480.3 301.4 483 287.7 478 275.7C473 263.7 461.4 256 448.5 256L192.5 256C179.6 256 167.9 263.8 162.9 275.8C157.9 287.8 160.7 301.5 169.9 310.6L297.9 438.6L300.3 440.8z"/></svg>
                            </button>
                            <button type="button" class="entity-media__button entity-media__button--cover" data-media-action="cover" data-photo-id="${photoId}" aria-pressed="${photo.is_cover ? 'true' : 'false'}" ${photo.is_cover ? 'disabled' : ''}>Definir capa</button>
                            <button type="button" class="entity-media__button entity-media__button--icon entity-media__button--danger" data-media-action="delete" data-photo-id="${photoId}" title="Excluir imagem" aria-label="Excluir imagem">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    function findEntityMediaManager(entityType, entityId) {
        return Array.from(document.querySelectorAll('[data-media-manager]')).find((manager) => (
            manager.dataset.entityType === String(entityType) &&
            safeInt(manager.dataset.entityId) === safeInt(entityId)
        )) || null;
    }

    async function loadEntityPhotos(entityType, entityId) {
        const manager = findEntityMediaManager(entityType, entityId);
        if (!manager) {
            return;
        }

        const status = manager.querySelector('[data-media-status]');
        if (status) {
            status.textContent = 'Carregando imagens...';
        }

        try {
            const result = await fetchJson(entityPhotosApiUrl('list', { tipo: entityType, id: safeInt(entityId) }));
            if (result.success) {
                renderEntityPhotos(manager, result.data);
                markModalFormPristine();
            } else if (status) {
                status.textContent = result.error || 'Erro ao carregar imagens.';
            }
        } catch (err) {
            console.error(err);
            if (status) {
                status.textContent = 'Erro ao carregar imagens.';
            }
        }
    }

    function initEntityMediaManagers() {
        document.querySelectorAll('[data-media-manager][data-entity-id]').forEach((manager) => {
            const entityType = manager.dataset.entityType;
            const entityId = safeInt(manager.dataset.entityId);
            if (entityType && entityId) {
                loadEntityPhotos(entityType, entityId);
            }
        });
    }

    function refreshEntityMediaOwnerList(entityType) {
        if (entityType === 'evento') {
            loadEvents();
            return;
        }

        loadItems();
    }

    async function uploadEntityPhotoFiles(manager, files) {
        const entityType = manager?.dataset.entityType;
        const entityId = safeInt(manager?.dataset.entityId);
        if (!manager || !entityType || !entityId || !files.length) {
            return;
        }

        const status = manager.querySelector('[data-media-status]');
        if (status) {
            status.textContent = 'Enviando imagens...';
        }

        const formData = new FormData();
        formData.append('tipo', entityType);
        formData.append('id', String(entityId));
        files.forEach((file) => formData.append('images[]', file));

        try {
            const result = await fetchJson(entityPhotosApiUrl('create'), {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData,
            }, false);

            if (result.success) {
                renderEntityPhotos(manager, result.data);
                showToast(result.message || 'Imagem enviada.', 'success');
                if (Array.isArray(result.data?.skipped) && result.data.skipped.length > 0) {
                    showToast(uploadErrorMessageFromSkipped(result.data?.skipped, 'Algumas imagens foram ignoradas.'), 'warning');
                }
                refreshEntityMediaOwnerList(entityType);
            } else {
                showToast(uploadErrorMessageFromApi(result.error, 'Erro ao enviar imagem.'), 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao enviar imagem.', 'error');
        } finally {
            markModalFormPristine();
        }
    }

    async function uploadEntityPhotos(input) {
        const manager = input?.closest('[data-media-manager]');
        const files = Array.from(input?.files || []);
        await uploadEntityPhotoFiles(manager, files);
        if (input) {
            input.value = '';
        }
    }

    function handleEntityMediaDrop(event) {
        const dropzone = event.target.closest('[data-media-dropzone]');
        if (!dropzone) {
            return;
        }

        event.preventDefault();
        dropzone.classList.remove('is-dragover');
        const manager = dropzone.closest('[data-media-manager]');
        const files = Array.from(event.dataTransfer.files || []);
        uploadEntityPhotoFiles(manager, files);
    }

    async function setEntityPhotoCover(button) {
        const manager = button?.closest('[data-media-manager]');
        const photoId = safeInt(button?.dataset.photoId);
        if (!manager || !photoId) {
            return;
        }

        try {
            const result = await fetchJson(entityPhotosApiUrl('set_cover', { id: photoId }), {
                method: 'POST',
                headers: csrfHeaders(),
            }, false);

            if (result.success) {
                renderEntityPhotos(manager, result.data);
                showToast(result.message || 'Capa atualizada.', 'success');
                refreshEntityMediaOwnerList(manager.dataset.entityType);
                markModalFormPristine();
            } else {
                showToast(result.error || 'Erro ao definir capa.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao definir capa.', 'error');
        }
    }

    async function deleteEntityPhoto(button) {
        const manager = button?.closest('[data-media-manager]');
        const photoId = safeInt(button?.dataset.photoId);
        if (!manager || !photoId || !confirm('Tem certeza que deseja excluir esta imagem?')) {
            return;
        }

        try {
            const result = await fetchJson(entityPhotosApiUrl('delete', { id: photoId }), {
                method: 'POST',
                headers: csrfHeaders(),
            }, false);

            if (result.success) {
                renderEntityPhotos(manager, result.data);
                showToast(result.message || 'Imagem removida.', 'success');
                refreshEntityMediaOwnerList(manager.dataset.entityType);
                markModalFormPristine();
            } else {
                showToast(result.error || 'Erro ao excluir imagem.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao excluir imagem.', 'error');
        }
    }

    async function updateEntityPhotoCaption(input) {
        const manager = input?.closest('[data-media-manager]');
        const photoId = safeInt(input?.dataset.photoId);
        if (!manager || !photoId) {
            return;
        }

        const formData = new FormData();
        formData.append('legenda', input.value.trim());

        try {
            const result = await fetchJson(entityPhotosApiUrl('update_legenda', { id: photoId }), {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData,
            }, false);

            if (result.success) {
                renderEntityPhotos(manager, result.data);
                showToast(result.message || 'Legenda atualizada.', 'success');
                markModalFormPristine();
            } else {
                showToast(result.error || 'Erro ao atualizar legenda.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao atualizar legenda.', 'error');
        }
    }

    async function reorderEntityPhotos(button) {
        const manager = button?.closest('[data-media-manager]');
        const photoId = safeInt(button?.dataset.photoId);
        const direction = button?.dataset.mediaAction === 'move-up' ? -1 : 1;
        const entityType = manager?.dataset.entityType;
        const entityId = safeInt(manager?.dataset.entityId);

        if (!manager || !photoId || !entityType || !entityId) {
            return;
        }

        const ids = Array.from(manager.querySelectorAll('[data-photo-id].entity-media__thumb'))
            .map((card) => safeInt(card.dataset.photoId))
            .filter(Boolean);
        const index = ids.indexOf(photoId);
        const targetIndex = index + direction;
        if (index < 0 || targetIndex < 0 || targetIndex >= ids.length) {
            return;
        }

        [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];

        try {
            const result = await fetchJson(entityPhotosApiUrl('reorder', { tipo: entityType, id: entityId }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify({ ids }),
            }, false);

            if (result.success) {
                renderEntityPhotos(manager, result.data);
                showToast(result.message || 'Ordem atualizada.', 'success');
                markModalFormPristine();
            } else {
                showToast(result.error || 'Erro ao atualizar ordem.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao atualizar ordem.', 'error');
        }
    }

    window.loadEntityPhotos = loadEntityPhotos;
    window.uploadEntityPhotos = uploadEntityPhotos;
    window.setEntityPhotoCover = setEntityPhotoCover;
    window.deleteEntityPhoto = deleteEntityPhoto;
    window.updateEntityPhotoCaption = updateEntityPhotoCaption;
    window.reorderEntityPhotos = reorderEntityPhotos;
    window.handleEntityMediaDrop = handleEntityMediaDrop;

    function openModal(title, contentHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHtml;
        modalOverlay.classList.remove('hidden');
        const itemForm = document.getElementById('form-item');
        if (itemForm) {
            enhanceItemFilterField(itemForm.elements.filtros?.value || '');
            enhanceOpeningHoursField();
        }
        initEntityMediaManagers();
        markModalFormPristine();
    }

    function closeModal(options = {}) {
        if (!options.force && isFormDirty() && !confirm('Existem alterações não salvas. Deseja fechar mesmo assim?')) {
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

        const mediaButton = event.target.closest('[data-media-action]');
        if (mediaButton?.dataset.mediaAction === 'cover') {
            setEntityPhotoCover(mediaButton);
            return;
        }
        if (mediaButton?.dataset.mediaAction === 'delete') {
            deleteEntityPhoto(mediaButton);
            return;
        }
        if (mediaButton?.dataset.mediaAction === 'move-up' || mediaButton?.dataset.mediaAction === 'move-down') {
            reorderEntityPhotos(mediaButton);
            return;
        }

        if (event.target === modalOverlay) {
            closeModalSafely();
        }
    });
    modalOverlay.addEventListener('change', (event) => {
        const target = event.target;
        if (target?.dataset?.mediaAction === 'upload') {
            uploadEntityPhotos(target);
            return;
        }
        if (target?.dataset?.mediaAction === 'caption') {
            updateEntityPhotoCaption(target);
        }
    });
    modalOverlay.addEventListener('dragenter', (event) => {
        const dropzone = event.target.closest('[data-media-dropzone]');
        if (!dropzone) {
            return;
        }

        event.preventDefault();
        dropzone.classList.add('is-dragover');
    });
    modalOverlay.addEventListener('dragover', (event) => {
        const dropzone = event.target.closest('[data-media-dropzone]');
        if (!dropzone) {
            return;
        }

        event.preventDefault();
        dropzone.classList.add('is-dragover');
    });
    modalOverlay.addEventListener('dragleave', (event) => {
        const dropzone = event.target.closest('[data-media-dropzone]');
        if (!dropzone || (event.relatedTarget instanceof Node && dropzone.contains(event.relatedTarget))) {
            return;
        }

        dropzone.classList.remove('is-dragover');
    });
    modalOverlay.addEventListener('drop', handleEntityMediaDrop);
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
                        <label>Faixa de Preço</label>
                        <select class="form-control" name="hosting_extra_faixa_preco">
                            ${renderHostingSelectOptions(HOSTING_EXTRA_SCHEMA.priceOptions, extra.faixa_preco)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Média de Diária</label>
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
                            ${renderHostingToggle('hosting_extra_cafe_manha_incluso', 'Café da manhã incluso', extra.cafe_manha_incluso)}
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
                        <label>Observações Úteis</label>
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
                        <label>Faixa de Preço</label>
                        <select class="form-control" name="gastronomy_extra_faixa_preco">
                            ${renderGastronomySelectOptions(GASTRONOMY_EXTRA_SCHEMA.priceOptions, extra.faixa_preco)}
                        </select>
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Refeições</label>
                        <div class="gastronomy-extra__options">
                            ${renderGastronomyCheckboxOptions(GASTRONOMY_EXTRA_SCHEMA.mealOptions, extra.refeicoes, 'gastronomy_extra_refeicoes')}
                        </div>
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Serviços</label>
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
                        <label>Link do cardápio</label>
                        <input type="url" class="form-control" name="gastronomy_extra_link_cardapio" placeholder="Ex: https://www.restaurante.com.br/cardapio" value="${escapeAttr(extra.link_cardapio || '')}">
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Formas de pagamento</label>
                        <div class="gastronomy-extra__options">
                            ${renderGastronomyCheckboxOptions(GASTRONOMY_EXTRA_SCHEMA.paymentOptions, extra.formas_pagamento, 'gastronomy_extra_formas_pagamento')}
                        </div>
                    </div>
                    <div class="form-group gastronomy-extra__wide">
                        <label>Observações Úteis</label>
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
                    <h3>Dados do serviço</h3>
                </div>
                <div class="services-extra__grid">
                    <div class="form-group">
                        <label>Tipo de serviço</label>
                        <select class="form-control" name="services_extra_tipo_servico">
                            ${renderServicesSelectOptions(SERVICES_EXTRA_SCHEMA.typeOptions, extra.tipo_servico)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Área de atendimento</label>
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
                        <label>Link do serviço</label>
                        <input type="url" class="form-control" name="services_extra_link_servico" placeholder="Ex: https://www.servico.com.br/agenda" value="${escapeAttr(extra.link_servico || '')}">
                    </div>
                    <div class="form-group services-extra__wide">
                        <label>Formas de pagamento</label>
                        <div class="services-extra__options">
                            ${renderServicesCheckboxOptions(SERVICES_EXTRA_SCHEMA.paymentOptions, extra.formas_pagamento, 'services_extra_formas_pagamento')}
                        </div>
                    </div>
                    <div class="form-group services-extra__wide">
                        <label>Observações Úteis</label>
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
                    <h3>Dados da experiência</h3>
                </div>
                <div class="experiences-extra__grid">
                    <div class="form-group">
                        <label>Tipo de experiência</label>
                        <select class="form-control" name="experiences_extra_tipo_experiencia">
                            ${renderExperiencesSelectOptions(EXPERIENCES_EXTRA_SCHEMA.typeOptions, extra.tipo_experiencia)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nível de dificuldade</label>
                        <select class="form-control" name="experiences_extra_nivel_dificuldade">
                            ${renderExperiencesSelectOptions(EXPERIENCES_EXTRA_SCHEMA.difficultyOptions, extra.nivel_dificuldade)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Duração média</label>
                        <input type="text" class="form-control" name="experiences_extra_duracao_media" placeholder="Ex: 2 horas" value="${escapeAttr(extra.duracao_media || '')}">
                    </div>
                    <div class="form-group">
                        <label>Melhor período</label>
                            <input type="text" class="form-control" name="experiences_extra_melhor_periodo" placeholder="Ex: Manhã, seca, fim de tarde" value="${escapeAttr(extra.melhor_periodo || '')}">
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Público indicado</label>
                        <div class="experiences-extra__options">
                            ${renderExperiencesCheckboxOptions(EXPERIENCES_EXTRA_SCHEMA.audienceOptions, extra.publico_indicado, 'experiences_extra_publico_indicado')}
                        </div>
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Estrutura disponível</label>
                        <div class="experiences-extra__options">
                            ${renderExperiencesCheckboxOptions(EXPERIENCES_EXTRA_SCHEMA.structureOptions, extra.estrutura_disponivel, 'experiences_extra_estrutura_disponivel')}
                        </div>
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Diferenciais</label>
                        <div class="experiences-extra__toggles">
                            ${renderExperiencesToggle('experiences_extra_agendamento_obrigatorio', 'Agendamento obrigatório', extra.agendamento_obrigatorio)}
                            ${renderExperiencesToggle('experiences_extra_entrada_gratuita', 'Entrada gratuita', extra.entrada_gratuita)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Preço base</label>
                        <input type="text" class="form-control" name="experiences_extra_preco_base" placeholder="Ex: Gratuito ou R$ 50 por pessoa" value="${escapeAttr(extra.preco_base || '')}">
                    </div>
                    <div class="form-group">
                        <label>Link de informações</label>
                        <input type="url" class="form-control" name="experiences_extra_link_informacoes" placeholder="Ex: https://www.experiencia.com.br" value="${escapeAttr(extra.link_informacoes || '')}">
                    </div>
                    <div class="form-group experiences-extra__wide">
                        <label>Observações Úteis</label>
                        <textarea class="form-control" name="experiences_extra_observacoes_uteis" rows="3" placeholder="Ex: Levar água, calçado fechado e protetor solar.">${escapeHtml(extra.observacoes_uteis || '')}</textarea>
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
                <input type="hidden" name="imagem_capa" id="imagem_capa_hidden" value="${item ? escapeAttr(item.imagem_capa || '') : ''}">
                ${renderEntityMediaManager('item', id, item?.imagem_capa || '', context.imageLabel)}
                <input type="hidden" name="is_destaque" value="${item && isCheckedValue(item.is_destaque) ? '1' : ''}">
                <div class="form-group entity-media__followup-toggle">
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
                    const typeLabel = getItemTypeLabelForTable(item, context);
                    tbody.innerHTML += `
                        <tr>
                            <td>
                                ${safeImagePath(item.imagem_capa) ? `<img src="../${escapeAttr(safeImagePath(item.imagem_capa))}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" alt="">` : '<div style="width:50px; height:50px; background:#333; border-radius:8px;"></div>'}
                            </td>
                            <td><strong>${escapeHtml(item.titulo)}</strong><br><small class="text-muted">${escapeHtml(item.endereco)}</small></td>
                            <td>${escapeHtml(typeLabel)}</td>
                            <td><span class="status-badge ${item.ativo ? 'status-active' : ''}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                            <td>
                                <div class="table-actions">
                                    <button type="button" class="table-action-btn table-action-btn--edit" onclick="editItem(${safeInt(item.id)})" title="Editar item" aria-label="Editar item">
                                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"/></svg>
                                    </button>
                                    <button type="button" class="table-action-btn table-action-btn--delete" onclick="deleteItem(${safeInt(item.id)})" title="Excluir item" aria-label="Excluir item">
                                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>
                                    </button>
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
                    <label>Endereço</label>
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
                    <label>Preço base</label>
                    <input type="text" class="form-control" name="preco_base" placeholder="Ex: Entrada gratuita - ou - A partir de R$ 20" value="${ev ? escapeAttr(ev.preco_base) : ''}">
                </div>
                <input type="hidden" name="imagem_capa" id="event_imagem_capa_hidden" value="${ev ? escapeAttr(ev.imagem_capa || '') : ''}">
                ${renderEntityMediaManager('evento', id, ev?.imagem_capa || '', 'Fotos do evento')}
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

    const GALLERY_UPLOAD_ACTION_SELECTOR = '[data-gallery-action="upload"]';
    const GALLERY_COVER_LIMIT = 7;
    const GALLERY_COVER_LABELS = ['Capa 1', 'Capa 2', 'Capa 3', 'Capa 4', 'Capa 5', 'Capa 6', 'Capa 7'];
    const GALLERY_CREATE_ENDPOINT = 'api/gallery.php?action=create';
    const GALLERY_REORDER_ENDPOINT = 'api/gallery.php?action=reorder';
    const GALLERY_SET_COVER_ENDPOINT = 'api/gallery.php?action=set_cover';

    function galleryApiUrl(action, params = {}) {
        const query = new URLSearchParams({ action, ...params });
        return `api/gallery.php?${query.toString()}`;
    }

    function galleryPhotosFromResponse(result) {
        if (Array.isArray(result?.data)) {
            return result.data;
        }

        if (Array.isArray(result?.data?.photos)) {
            return result.data.photos;
        }

        return [];
    }

    function getGalleryManager() {
        return document.querySelector('[data-gallery-manager]');
    }

    function renderGalleryCoverOptions(currentSlot, occupiedCoverSlots = new Set()) {
        let options = `<option value="0" ${safeInt(currentSlot) === 0 ? 'selected' : ''}>Sem atribuição</option>`;
        for (let slot = 1; slot <= GALLERY_COVER_LIMIT; slot += 1) {
            const isCurrent = safeInt(currentSlot) === slot;
            const isOccupied = occupiedCoverSlots.has(slot) && !isCurrent;
            const label = GALLERY_COVER_LABELS[slot - 1] || `Capa ${slot}`;
            const suffix = isCurrent ? ' - atual' : (isOccupied ? ' - ocupada' : '');
            options += `<option value="${slot}" data-occupied="${isOccupied ? 'true' : 'false'}" ${isCurrent ? 'selected' : ''}>${label}${suffix}</option>`;
        }
        return options;
    }

    function showGalleryCaptionLimitPopup(input) {
        const wrapper = input?.parentElement;
        if (!wrapper) {
            return;
        }

        wrapper.querySelectorAll('.gallery-caption-limit-popup').forEach((popup) => popup.remove());
        const popup = document.createElement('span');
        popup.className = 'gallery-caption-limit-popup';
        popup.textContent = 'Máximo de caracteres 160';
        wrapper.append(popup);
        setTimeout(() => popup.remove(), 2500);
    }

    function renderGalleryPhotos(photos) {
        const manager = getGalleryManager();
        const grid = manager?.querySelector('[data-gallery-grid]');
        const status = manager?.querySelector('[data-gallery-status]');
        if (!grid || !status) {
            return;
        }

        const validPhotos = Array.isArray(photos) ? photos.filter((photo) => safeImagePath(photo.url_imagem)) : [];
        if (validPhotos.length === 0) {
            status.textContent = 'Nenhuma imagem cadastrada.';
            grid.innerHTML = '<p class="entity-media__caption" style="grid-column: 1 / -1;">Nenhuma foto na galeria.</p>';
            return;
        }

        status.textContent = `${validPhotos.length} imagem(ns) cadastrada(s).`;
        const occupiedCoverSlots = new Set(validPhotos
            .map((photo) => safeInt(photo.cover_slot))
            .filter((slot) => slot >= 1 && slot <= GALLERY_COVER_LIMIT));
        grid.innerHTML = validPhotos.map((photo, index) => {
            const photoId = safeInt(photo.id);
            const image = safeImagePath(photo.url_imagem);
            const coverSlot = safeInt(photo.cover_slot);

            return `
                <article class="entity-media__thumb gallery-media__thumb" data-gallery-photo-id="${photoId}">
                    <div class="entity-media__image" style="background-image:url('../${escapeAttr(image)}')">
                        ${coverSlot ? `<span class="entity-media__cover-badge">Capa ${coverSlot}</span>` : ''}
                    </div>
                    <div class="entity-media__body">
                        <input type="text" class="form-control entity-media__caption-input" value="${escapeAttr(photo.legenda || '')}" placeholder="Legenda da imagem" maxlength="160" data-gallery-action="caption" data-photo-id="${photoId}">
                        <select class="form-control gallery-media__cover-select" data-gallery-action="cover-slot" data-photo-id="${photoId}" aria-label="Definir posicao de capa">
                            ${renderGalleryCoverOptions(coverSlot, occupiedCoverSlots)}
                        </select>
                        <div class="entity-media__actions">
                            <button type="button" class="entity-media__button entity-media__button--icon" data-gallery-action="move-up" data-photo-id="${photoId}" title="Subir imagem" aria-label="Subir imagem" ${index === 0 ? 'disabled' : ''}>
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M300.3 199.2C312.9 188.9 331.4 189.7 343.1 201.4L471.1 329.4C480.3 338.6 483 352.3 478 364.3C473 376.3 461.4 384 448.5 384L192.5 384C179.6 384 167.9 376.2 162.9 364.2C157.9 352.2 160.7 338.5 169.9 329.4L297.9 201.4L300.3 199.2z"/></svg>
                            </button>
                            <button type="button" class="entity-media__button entity-media__button--icon" data-gallery-action="move-down" data-photo-id="${photoId}" title="Descer imagem" aria-label="Descer imagem" ${index === validPhotos.length - 1 ? 'disabled' : ''}>
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M300.3 440.8C312.9 451 331.4 450.3 343.1 438.6L471.1 310.6C480.3 301.4 483 287.7 478 275.7C473 263.7 461.4 256 448.5 256L192.5 256C179.6 256 167.9 263.8 162.9 275.8C157.9 287.8 160.7 301.5 169.9 310.6L297.9 438.6L300.3 440.8z"/></svg>
                            </button>
                            <button type="button" class="entity-media__button entity-media__button--icon entity-media__button--danger" data-gallery-action="delete" data-photo-id="${photoId}" title="Excluir imagem" aria-label="Excluir imagem">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z"/></svg>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    async function loadGallery() {
        const manager = getGalleryManager();
        const grid = manager?.querySelector('[data-gallery-grid]');
        const status = manager?.querySelector('[data-gallery-status]');
        if(!grid || !status) return;
        status.textContent = 'Carregando imagens...';

        try {
            const data = await fetchJson('api/gallery.php?action=list');
            if (data.success && data.data) {
                renderGalleryPhotos(galleryPhotosFromResponse(data));
            }
        } catch(e) {
            console.error('Erro ao carregar galeria', e);
            status.textContent = 'Erro ao carregar.';
        }
    }

    async function uploadGalleryPhotoFiles(files) {
        const fileList = Array.from(files || []);
        if(!fileList.length) return;

        const status = getGalleryManager()?.querySelector('[data-gallery-status]');
        if (status) {
            status.textContent = 'Enviando imagens...';
        }

        const formData = new FormData();
        fileList.forEach((file) => formData.append('images[]', file));

        try {
            const result = await fetchJson(GALLERY_CREATE_ENDPOINT, {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData
            }, false);
            if(result.success) {
                renderGalleryPhotos(galleryPhotosFromResponse(result));
                showToast(result.message || 'Imagem enviada.', 'success');
                if (Array.isArray(result.data?.skipped) && result.data.skipped.length > 0) {
                    showToast(uploadErrorMessageFromSkipped(result.data?.skipped, 'Algumas imagens foram ignoradas.'), 'warning');
                }
            } else {
                showToast(uploadErrorMessageFromApi(result.error, 'Erro ao enviar foto.'), 'error');
            }
        } catch(err) {
            console.error(err);
            showToast('Erro ao enviar foto.', 'error');
        }
    }

    function handleGalleryMediaDrop(event) {
        const dropzone = event.target.closest('[data-gallery-dropzone]');
        if (!dropzone) {
            return;
        }

        event.preventDefault();
        dropzone.classList.remove('is-dragover');
        uploadGalleryPhotoFiles(event.dataTransfer.files);
    }

    window.uploadGalleryPhoto = async (e) => {
        await uploadGalleryPhotoFiles(e?.target?.files);
        if (e?.target) {
            e.target.value = '';
        }
    };

    async function updateGalleryPhotoCaption(input) {
        const id = safeInt(input?.dataset.photoId);
        if (!id) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('legenda', input.value.trim());
            const result = await fetchJson(galleryApiUrl('update_legenda', { id }), {
                method: 'POST',
                headers: csrfHeaders(),
                body: formData
            }, false);

            if (result.success) {
                renderGalleryPhotos(galleryPhotosFromResponse(result));
                showToast(result.message || 'Legenda atualizada.', 'success');
            } else {
                showToast(result.error || 'Erro ao atualizar legenda.', 'error');
            }
        } catch(err) {
            console.error(err);
            showToast('Erro ao atualizar legenda.', 'error');
        }
    }

    window.updatePhotoLegenda = async (id, legenda) => {
        const input = document.createElement('input');
        input.dataset.photoId = String(safeInt(id));
        input.value = legenda;
        await updateGalleryPhotoCaption(input);
    };

    async function reorderGalleryPhotos(button) {
        const manager = button?.closest('[data-gallery-manager]');
        const photoId = safeInt(button?.dataset.photoId);
        const direction = button?.dataset.galleryAction === 'move-up' ? -1 : 1;
        if (!manager || !photoId) {
            return;
        }

        const ids = Array.from(manager.querySelectorAll('[data-gallery-photo-id]'))
            .map((card) => safeInt(card.dataset.galleryPhotoId))
            .filter(Boolean);
        const index = ids.indexOf(photoId);
        const targetIndex = index + direction;
        if (index < 0 || targetIndex < 0 || targetIndex >= ids.length) {
            return;
        }

        [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];

        try {
            const result = await fetchJson(GALLERY_REORDER_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify({ ids }),
            }, false);

            if (result.success) {
                renderGalleryPhotos(galleryPhotosFromResponse(result));
                showToast(result.message || 'Ordem atualizada.', 'success');
            } else {
                showToast(result.error || 'Erro ao atualizar ordem.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao atualizar ordem.', 'error');
        }
    }

    async function setGalleryCoverSlot(select) {
        const photoId = safeInt(select?.dataset.photoId);
        const slot = Number.parseInt(select?.value, 10);
        if (!photoId || Number.isNaN(slot)) {
            return;
        }

        try {
            const result = await fetchJson(`${GALLERY_SET_COVER_ENDPOINT}&id=${photoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify({ slot }),
            }, false);

            if (result.success) {
                renderGalleryPhotos(galleryPhotosFromResponse(result));
                showToast(result.message || 'Capa atualizada.', 'success');
            } else {
                showToast(result.error || 'Erro ao definir capa.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro ao definir capa.', 'error');
        }
    }

    window.deleteGalleryPhoto = async (id) => {
        if(!confirm('Tem certeza que deseja excluir esta foto da galeria?')) return;

        try {
            const result = await fetchJson(galleryApiUrl('delete', { id: safeInt(id) }), {
                method: 'DELETE',
                headers: csrfHeaders()
            }, false);
            if(result.success) {
                renderGalleryPhotos(galleryPhotosFromResponse(result));
                showToast(result.message || 'Foto removida.', 'success');
            } else {
                showToast(result.error || 'Erro ao deletar foto.', 'error');
            }
        } catch(err) {
            console.error(err);
            showToast('Erro ao deletar foto.', 'error');
        }
    };

    document.addEventListener('click', (event) => {
        const galleryButton = event.target.closest('[data-gallery-action]');
        if (!galleryButton?.closest('[data-gallery-manager]')) {
            return;
        }

        if (galleryButton.dataset.galleryAction === 'delete') {
            window.deleteGalleryPhoto(galleryButton.dataset.photoId);
            return;
        }

        if (galleryButton.dataset.galleryAction === 'move-up' || galleryButton.dataset.galleryAction === 'move-down') {
            reorderGalleryPhotos(galleryButton);
        }
    });

    document.addEventListener('change', (event) => {
        const target = event.target;
        if (!target?.closest?.('[data-gallery-manager]')) {
            return;
        }

        if (target.matches(GALLERY_UPLOAD_ACTION_SELECTOR)) {
            window.uploadGalleryPhoto({ target });
            return;
        }

        if (target.dataset.galleryAction === 'caption') {
            updateGalleryPhotoCaption(target);
            return;
        }

        if (target.dataset.galleryAction === 'cover-slot') {
            setGalleryCoverSlot(target);
        }
    });

    document.addEventListener('input', (event) => {
        const target = event.target;
        if (target?.dataset?.galleryAction !== 'caption') {
            return;
        }

        const maxLength = Number.parseInt(target.getAttribute('maxlength') || '160', 10);
        if (target.value.length > maxLength) {
            target.value = target.value.slice(0, maxLength);
            showGalleryCaptionLimitPopup(target);
        }
    });

    document.addEventListener('keydown', (event) => {
        const target = event.target;
        if (target?.dataset?.galleryAction !== 'caption') {
            return;
        }

        const maxLength = Number.parseInt(target.getAttribute('maxlength') || '160', 10);
        const allowedKeys = [
            'Backspace',
            'Delete',
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'Tab',
            'Enter',
            'Escape',
        ];
        const hasSelection = target.selectionStart !== target.selectionEnd;
        if (
            target.value.length >= maxLength &&
            !hasSelection &&
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !allowedKeys.includes(event.key)
        ) {
            event.preventDefault();
            showGalleryCaptionLimitPopup(target);
        }
    });

    document.addEventListener('dragenter', (event) => {
        const dropzone = event.target.closest('[data-gallery-dropzone]');
        if (!dropzone) {
            return;
        }

        event.preventDefault();
        dropzone.classList.add('is-dragover');
    });

    document.addEventListener('dragover', (event) => {
        const dropzone = event.target.closest('[data-gallery-dropzone]');
        if (!dropzone) {
            return;
        }

        event.preventDefault();
        dropzone.classList.add('is-dragover');
    });

    document.addEventListener('dragleave', (event) => {
        const dropzone = event.target.closest('[data-gallery-dropzone]');
        if (!dropzone || (event.relatedTarget instanceof Node && dropzone.contains(event.relatedTarget))) {
            return;
        }

        dropzone.classList.remove('is-dragover');
    });

    document.addEventListener('drop', handleGalleryMediaDrop);

    window.renderGalleryPhotos = renderGalleryPhotos;
    window.uploadGalleryPhotoFiles = uploadGalleryPhotoFiles;
    window.handleGalleryMediaDrop = handleGalleryMediaDrop;
    window.updateGalleryPhotoCaption = updateGalleryPhotoCaption;
    window.reorderGalleryPhotos = reorderGalleryPhotos;
    window.setGalleryCoverSlot = setGalleryCoverSlot;

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
