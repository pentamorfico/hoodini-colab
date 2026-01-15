function render({ model, el }) {
    el.style.width = '100%';
    el.style.display = 'block';

    // --- STATE MANAGEMENT ---
    let currentMode = 'single'; // single, list, sheet
    
    const params = {
        'Input/Output': [
            { name: 'input', type: 'text', label: 'Input', desc: 'Protein ID, FASTA, or file path', modes: ['single', 'list'] },
            { name: 'output', type: 'text', label: 'Output Folder', desc: 'Output folder name', def: 'hoodini_output' },
            { name: 'force', type: 'bool', label: 'Force Overwrite', desc: 'Force re-download and overwrite existing files', def: true }
        ],
        'Remote BLAST': [
            { name: 'remote-evalue', type: 'float', label: 'E-value', desc: 'Remote BLAST E-value', def: 0.001, modes: ['single'] },
            { name: 'remote-max-targets', type: 'int', label: 'Max Targets', desc: 'Max targets to retrieve', def: 100, modes: ['single'] }
        ],
        'Performance': [
            { name: 'num-threads', type: 'int', label: 'Threads', desc: 'Number of threads', def: 4 },
            { name: 'api-key', type: 'text', label: 'NCBI API Key', desc: 'NCBI API key' }
        ],
        'Neighborhood Window': [
            { name: 'win-mode', type: 'select', label: 'Window Mode', desc: 'Window mode', options: ['win_nts', 'win_genes'], def: 'win_genes' },
            { name: 'win', type: 'int', label: 'Window Size', desc: 'Window size', def: 20000 },
            { name: 'min-win', type: 'int', label: 'Min Window', desc: 'Min window size' },
            { name: 'min-win-type', type: 'select', label: 'Min Window Type', desc: 'Type of min window', options: ['total', 'upstream', 'downstream', 'both'] }
        ],
        'Clustering': [
            { name: 'cand-mode', type: 'select', label: 'Candidate Mode', desc: 'IPG representative mode', options: ['any_ipg', 'best_ipg', 'best_id', 'one_id', 'same_id'], def: 'best_ipg' },
            { name: 'clust-method', type: 'select', label: 'Clustering Method', desc: 'Clustering method', options: ['diamond_deepclust', 'deepmmseqs', 'jackhmmer', 'blastp'], def: 'diamond_deepclust' }
        ],
        'Tree Construction': [
            { name: 'tree-mode', type: 'select', label: 'Tree Mode', desc: 'Tree building method', options: ['taxonomy', 'fast_nj', 'aai_tree', 'ani_tree', 'fast_ml', 'neigh_similarity_tree', 'neigh_phylo_tree'], def: 'taxonomy' }
        ],
        'Pairwise Comparisons': [
            { name: 'ani-mode', type: 'select', label: 'ANI Mode', desc: 'ANI calculation method', options: ['skani', 'blastn'] },
            { name: 'nt-aln-mode', type: 'select', label: 'NT Alignment', desc: 'Nucleotide alignment mode', options: ['blastn', 'fastani', 'minimap2', 'intergenic_blastn'], def: 'blastn' },
            { name: 'aai-mode', type: 'select', label: 'AAI Mode', desc: 'AAI/proteome similarity mode', options: ['wgrr', 'aai', 'hyper', 'all'], def: 'wgrr' },
            { name: 'aai-subset-mode', type: 'select', label: 'AAI Subset', desc: 'AAI subset mode', options: ['target_prot', 'target_region', 'window'], def: 'target_prot' },
            { name: 'min-pident', type: 'float', label: 'Min % Identity', desc: 'Min percent identity', def: 30 }
        ],
        'Annotations': [
            { name: 'padloc', type: 'bool', label: 'PADLOC', desc: 'Antiphage defense' },
            { name: 'deffinder', type: 'bool', label: 'DefenseFinder', desc: 'Antiphage defense' },
            { name: 'cctyper', type: 'bool', label: 'CCtyper', desc: 'CRISPR-Cas prediction' },
            { name: 'genomad', type: 'bool', label: 'geNomad', desc: 'MGE identification' },
            { name: 'domains', type: 'multiselect', label: 'Domains', desc: 'MetaCerberus DBs', 
              options: ['amrfinder', 'cazy', 'cog', 'foam', 'gvdb', 'kegg', 'kofam', 'methmmdb', 'nfixdb', 'pfam', 'pgap', 'phrog', 'pvog', 'tigrfam', 'vog-r225'] }
        ],
        'Links': [
            { name: 'prot-links', type: 'switch', label: 'Protein Links', desc: 'Pairwise protein comparisons', def: true },
            { name: 'nt-links', type: 'switch', label: 'Nucleotide Links', desc: 'Pairwise nucleotide comparisons' }
        ]
    };

    const state = {};
    const multiSelectState = {}; // For multiselect values
    const sheetData = []; // Table data for inputsheet mode
    
    Object.values(params).flat().forEach(p => {
        if (p.def !== undefined) state[p.name] = p.def;
        if (p.type === 'multiselect') multiSelectState[p.name] = [];
    });

    const categoryStyles = {
        'Remote BLAST': { bg: '#ede9fe', text: '#6d28d9' },
        'Input/Output': { bg: '#e0e7ff', text: '#4338ca' },
        'Performance': { bg: '#dcfce7', text: '#166534' },
        'Neighborhood Window': { bg: '#fef3c7', text: '#b45309' },
        'Clustering': { bg: '#fce7f3', text: '#be185d' },
        'Tree Construction': { bg: '#ccfbf1', text: '#0f766e' },
        'Pairwise Comparisons': { bg: '#ffedd5', text: '#c2410c' },
        'Annotations': { bg: '#f3f4f6', text: '#374151' },
        'Links': { bg: '#f3f4f6', text: '#374151' }
    };

    // Icons
    const icons = {
        chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
        chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
        copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
        play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
        check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        alert: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        terminal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
        dna: '<svg width="24" height="24" viewBox="0 0 175 220" fill="currentColor"><path d="M70.1 31.2c-2.8 1.3-5.2 3.8-6.3 6.5-.7 1.7-.8 4.2-.8 13.8 0 12 0 11.8 2.3 14.7 1.7 2.1 6 4.8 8.1 5 1.9.2 6-.9 7.9-2.1 2.8-1.8 4.7-4.6 5.2-7.6.3-1.9.5-6.1.3-12.5-.2-9-.4-10-2.3-12.5-1.2-1.5-3.2-3.3-4.5-4-2.9-1.4-7.3-1.8-9.9-.3zM116.4 40.7c-.3.8-.4 5.2-.2 9.8.3 8.2.3 8.5 3.1 11.6 3.5 4 7.2 5.4 12.7 4.9 3.8-.4 7.6-2.4 9.7-5 1.9-2.4 2.3-4 2.3-9.8 0-6.9-.7-9.8-2.8-12-2.6-2.6-6.8-4.2-11.2-4.2-4.5 0-7.5 1-9.4 3.1-1.4 1.6-3.5 1.4-4.2-.6zm-56.9 30.5c-.9.8-1.5 2.3-1.5 3.5 0 2.6 3.3 6.2 6.6 7.3 3.5 1.1 8.3.3 11.3-2 2.8-2.1 3.1-2.8 3.1-6.5 0-3.3-.4-4.2-2.6-6-2.5-2-3.1-2.1-8.7-1.8-4.2.2-6.7.8-8.2 1.5zm56.3 29.3c-2.8 1.3-5.2 3.8-6.3 6.5-.7 1.7-.8 4.2-.8 13.8 0 12 0 11.8 2.3 14.7 1.7 2.1 6 4.8 8.1 5 1.9.2 6-.9 7.9-2.1 2.8-1.8 4.7-4.6 5.2-7.6.3-1.9.5-6.1.3-12.5-.2-9-.4-10-2.3-12.5-1.2-1.5-3.2-3.3-4.5-4-2.9-1.4-7.3-1.8-9.9-.3zM59.6 109.7c-.3.8-.4 5.2-.2 9.8.3 8.2.3 8.5 3.1 11.6 3.5 4 7.2 5.4 12.7 4.9 3.8-.4 7.6-2.4 9.7-5 1.9-2.4 2.3-4 2.3-9.8 0-6.9-.7-9.8-2.8-12-2.6-2.6-6.8-4.2-11.2-4.2-4.5 0-7.5 1-9.4 3.1-1.4 1.6-3.5 1.4-4.2-.4zm56.9 30.5c-.9.8-1.5 2.3-1.5 3.5 0 2.6 3.3 6.2 6.6 7.3 3.5 1.1 8.3.3 11.3-2 2.8-2.1 3.1-2.8 3.1-6.5 0-3.3-.4-4.2-2.6-6-2.5-2-3.1-2.1-8.7-1.8-4.2.2-6.7.8-8.2 1.5zm-56.3 29.3c-2.8 1.3-5.2 3.8-6.3 6.5-.7 1.7-.8 4.2-.8 13.8 0 12 0 11.8 2.3 14.7 1.7 2.1 6 4.8 8.1 5 1.9.2 6-.9 7.9-2.1 2.8-1.8 4.7-4.6 5.2-7.6.3-1.9.5-6.1.3-12.5-.2-9-.4-10-2.3-12.5-1.2-1.5-3.2-3.3-4.5-4-2.9-1.4-7.3-1.8-9.9-.3z"/></svg>',
        x: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
        spinner: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner-icon"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>'
    };

    // --- LOGIC ---
    function buildCommand() {
        let cmd = 'hoodini run';
        
        // Handle inputsheet mode specially
        if (currentMode === 'sheet' && sheetData.length > 0) {
            // Convert sheetData to TSV format
            const tsvLines = [sheetColumns.join('\\t')];
            sheetData.forEach(row => {
                const values = sheetColumns.map(col => row[col] || '');
                tsvLines.push(values.join('\\t'));
            });
            // For now, indicate that a sheet file would be generated
            cmd += ' --inputsheet <input_sheet.tsv>';
        }
        
        Object.values(params).flat().forEach(param => {
            if (param.modes && !param.modes.includes(currentMode)) return;
            
            // Skip inputsheet param in sheet mode (handled above)
            if (currentMode === 'sheet' && param.name === 'inputsheet') return;
            
            let key = param.name;
            let value = state[key];
            
            // Handle multiselect
            if (param.type === 'multiselect') {
                const selected = multiSelectState[key] || [];
                if (selected.length > 0) {
                    cmd += ' --' + key + ' ' + selected.join(',');
                }
                return;
            }
            
            if (value === undefined || value === '' || value === null) return;
            
            if (typeof value === 'boolean') {
                if (value) cmd += ' --' + key;
            } else {
                let valStr = (typeof value === 'string' && value.includes(' ')) ? '"' + value + '"' : value;
                cmd += ' --' + key + ' ' + valStr;
            }
        });
        return cmd;
    }

    function updateCommand() {
        const cmdEl = el.querySelector('.command-output');
        if (cmdEl) {
            const cmd = buildCommand();
            cmdEl.textContent = cmd;
            model.set('command', cmd);
            model.save_changes();
        }
        updateStatus();
    }

    function updateStatus() {
        const badge = el.querySelector('.status-badge');
        if (badge) {
            let ready = false;
            if (currentMode === 'single' || currentMode === 'list') {
                ready = !!state.input;
            } else if (currentMode === 'sheet') {
                ready = sheetData.length > 0;
            }

            if (ready) {
                badge.className = 'status-badge status-ready';
                badge.innerHTML = icons.check + ' Ready';
            } else {
                badge.className = 'status-badge status-missing';
                badge.innerHTML = icons.alert + ' Input required';
            }
        }
    }

    function updateVisibility() {
        const items = el.querySelectorAll('.param-item[data-modes]');
        items.forEach(item => {
            const allowedModes = item.getAttribute('data-modes').split(',');
            if (allowedModes.includes(currentMode)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Re-render input field if it's the input parameter (to switch between text and textarea)
        const inputParam = params['Input/Output'].find(p => p.name === 'input');
        if (inputParam) {
            const inputContainer = el.querySelector('.param-item[data-modes]');
            if (inputContainer && (currentMode === 'single' || currentMode === 'list')) {
                // Update description
                const descEl = inputContainer.querySelector('.param-desc');
                if (descEl) {
                    descEl.textContent = currentMode === 'list' 
                        ? 'List of protein IDs, FASTA files, or file paths (one per line)'
                        : 'Protein ID, FASTA, or file path';
                }
                
                // Find the actual input element
                const oldInput = inputContainer.querySelector('.param-input, .param-textarea');
                if (oldInput) {
                    let newInput;
                    if (currentMode === 'list') {
                        newInput = document.createElement('textarea');
                        newInput.className = 'param-textarea';
                        newInput.rows = 6;
                        newInput.placeholder = 'Paste list of IDs (one per line)';
                    } else {
                        newInput = document.createElement('input');
                        newInput.className = 'param-input';
                        newInput.type = 'text';
                        newInput.placeholder = 'Enter protein ID, FASTA, or file path';
                    }
                    newInput.value = state.input || '';
                    newInput.onchange = function() {
                        state.input = newInput.value || undefined;
                        if (!newInput.value) delete state.input;
                        updateCommand();
                    };
                    oldInput.parentNode.replaceChild(newInput, oldInput);
                }
            }
        }
        
        const remoteCat = el.querySelector('.category-section[data-category="Remote BLAST"]');
        if (remoteCat) {
            remoteCat.style.display = (currentMode === 'single') ? 'block' : 'none';
        }

        const sheetTable = el.querySelector('.sheet-table-container');
        if (sheetTable) {
            sheetTable.style.display = (currentMode === 'sheet') ? 'block' : 'none';
        }

        updateCommand();
    }

    function createSwitch(param) {
        const container = document.createElement('div');
        container.className = 'switch-container';
        
        const label = document.createElement('span');
        label.className = 'switch-label';
        label.innerText = param.label;
        
        const toggleWrapper = document.createElement('label');
        toggleWrapper.className = 'switch-wrapper';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = state[param.name] || false;
        input.onchange = () => {
            state[param.name] = input.checked;
            updateCommand();
        };
        
        const slider = document.createElement('span');
        slider.className = 'switch-slider';
        
        toggleWrapper.appendChild(input);
        toggleWrapper.appendChild(slider);
        
        container.appendChild(label);
        container.appendChild(toggleWrapper);
        
        return container;
    }

    function createMultiSelect(param) {
        const container = document.createElement('div');
        container.className = 'multiselect-container';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'multiselect-label';
        labelEl.innerText = param.label;
        container.appendChild(labelEl);
        
        const descEl = document.createElement('div');
        descEl.className = 'multiselect-desc';
        descEl.innerText = param.desc;
        container.appendChild(descEl);
        
        // Selected tags
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'multiselect-tags';
        container.appendChild(tagsContainer);
        
        // Dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'multiselect-dropdown';
        
        param.options.forEach(opt => {
            const optEl = document.createElement('div');
            optEl.className = 'multiselect-option';
            optEl.textContent = opt;
            optEl.onclick = () => {
                if (!multiSelectState[param.name].includes(opt)) {
                    multiSelectState[param.name].push(opt);
                    renderTags();
                    updateCommand();
                }
            };
            dropdown.appendChild(optEl);
        });
        container.appendChild(dropdown);
        
        function renderTags() {
            tagsContainer.innerHTML = '';
            multiSelectState[param.name].forEach(val => {
                const tag = document.createElement('span');
                tag.className = 'multiselect-tag';
                tag.innerHTML = val + ' <span class="tag-remove">' + icons.x + '</span>';
                tag.querySelector('.tag-remove').onclick = (e) => {
                    e.stopPropagation();
                    multiSelectState[param.name] = multiSelectState[param.name].filter(v => v !== val);
                    renderTags();
                    updateCommand();
                };
                tagsContainer.appendChild(tag);
            });
            
            if (multiSelectState[param.name].length === 0) {
                const placeholder = document.createElement('span');
                placeholder.className = 'multiselect-placeholder';
                placeholder.textContent = 'Click to select databases...';
                tagsContainer.appendChild(placeholder);
            }
        }
        
        tagsContainer.onclick = () => {
            dropdown.classList.toggle('show');
        };
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        renderTags();
        return container;
    }

    function createInput(param) {
        const container = document.createElement('div');
        container.className = 'param-item';
        if (param.modes) {
            container.setAttribute('data-modes', param.modes.join(','));
        }

        if (param.type === 'switch') {
            const switchEl = createSwitch(param);
            container.appendChild(switchEl);
            const desc = document.createElement('div');
            desc.className = 'param-desc';
            desc.textContent = param.desc;
            container.appendChild(desc);
            return container;
        }

        if (param.type === 'bool') {
            const label = document.createElement('label');
            label.className = 'param-checkbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkbox-input';
            checkbox.checked = state[param.name] || false;
            checkbox.onchange = function() {
                state[param.name] = checkbox.checked;
                updateCommand();
            };
            const text = document.createElement('span');
            text.innerHTML = '<strong>' + param.label + '</strong> <code class="param-flag">--' + param.name + '</code>';
            label.appendChild(checkbox);
            label.appendChild(text);
            container.appendChild(label);
            const desc = document.createElement('div');
            desc.className = 'param-desc';
            desc.textContent = param.desc;
            desc.style.marginLeft = '26px';
            container.appendChild(desc);
        } else {
            const labelEl = document.createElement('div');
            labelEl.className = 'param-label';
            labelEl.innerHTML = param.label + ' <code class="param-flag">--' + param.name + '</code>';
            container.appendChild(labelEl);
            const descEl = document.createElement('div');
            descEl.className = 'param-desc';
            descEl.textContent = param.desc;
            container.appendChild(descEl);
            
            let input;
            if (param.type === 'select') {
                input = document.createElement('select');
                input.className = 'param-input';
                const emptyOpt = document.createElement('option');
                emptyOpt.value = '';
                emptyOpt.textContent = '-- Select --';
                input.appendChild(emptyOpt);
                param.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    if (state[param.name] === opt) option.selected = true;
                    input.appendChild(option);
                });
                if (param.def && !state[param.name]) {
                    input.value = param.def;
                    state[param.name] = param.def;
                }
            } else {
                // Special handling for input field in list mode - use textarea
                if (param.name === 'input' && currentMode === 'list') {
                    input = document.createElement('textarea');
                    input.className = 'param-textarea';
                    input.rows = 6;
                    input.placeholder = 'Paste list of IDs (one per line)';
                    if (state[param.name] !== undefined) input.value = state[param.name];
                } else {
                    input = document.createElement('input');
                    input.className = 'param-input';
                    input.type = (param.type === 'int' || param.type === 'float') ? 'number' : 'text';
                    if (param.type === 'float') input.step = '0.001';
                    input.placeholder = param.def !== undefined ? 'Default: ' + param.def : 'Enter ' + param.label.toLowerCase();
                    if (state[param.name] !== undefined) input.value = state[param.name];
                }
            }
            input.onchange = function() {
                const val = input.value;
                if (val === '') delete state[param.name];
                else if (param.type === 'int') state[param.name] = parseInt(val);
                else if (param.type === 'float') state[param.name] = parseFloat(val);
                else state[param.name] = val;
                updateCommand();
            };
            container.appendChild(input);
        }
        return container;
    }

    // --- SHEET TABLE FUNCTIONS ---
    const sheetColumns = ['protein_id', 'nucleotide_id', 'start', 'end', 'strand', 'uniprot_id', 'assembly_id'];
    
    function addSheetRow(data = {}) {
        const row = {};
        sheetColumns.forEach(col => {
            row[col] = data[col] || '';
        });
        sheetData.push(row);
        renderSheetTable();
    }
    
    function removeSheetRow(index) {
        sheetData.splice(index, 1);
        renderSheetTable();
    }
    
    function renderSheetTable() {
        const tbody = el.querySelector('.sheet-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        sheetData.forEach((row, idx) => {
            const tr = document.createElement('tr');
            
            sheetColumns.forEach(col => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = row[col] || '';
                input.className = 'sheet-cell-input';
                input.onchange = (e) => {
                    sheetData[idx][col] = e.target.value;
                };
                td.appendChild(input);
                tr.appendChild(td);
            });
            
            const tdAction = document.createElement('td');
            tdAction.className = 'sheet-action-cell';
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn-icon-small';
            btnDelete.innerHTML = icons.trash;
            btnDelete.onclick = () => removeSheetRow(idx);
            tdAction.appendChild(btnDelete);
            tr.appendChild(tdAction);
            
            tbody.appendChild(tr);
        });
    }
    
    function handleSheetPaste(e) {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const rows = paste.split('\\n').filter(r => r.trim());
        
        rows.forEach(row => {
            const values = row.split('\\t');
            const data = {};
            sheetColumns.forEach((col, idx) => {
                if (values[idx]) data[col] = values[idx].trim();
            });
            addSheetRow(data);
        });
    }

    // --- STYLES ---
    const styles = '@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"); ' +
    '.hoodini-launcher { font-family: "Space Grotesk", sans-serif; background: #fff; color: #1e293b; padding: 24px; border-radius: 12px; width: 100%; box-sizing: border-box; border: 1px solid #e2e8f0; }' +
    '.hoodini-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 24px; }' +
    '@media (max-width: 800px) { .hoodini-grid { grid-template-columns: 1fr; } }' +
    '.main-col { min-width: 0; }' +
    '.sidebar-col { min-width: 0; }' +
    
    '.hoodini-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }' +
    '.header-top { display: flex; justify-content: space-between; align-items: center; }' +
    '.hoodini-logo { color: #6366f1; display: flex; align-items: center; gap: 8px; }' +
    '.hoodini-title { font-size: 20px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px; }' +
    '.hoodini-subtitle { color: #64748b; font-size: 13px; font-weight: 400; }' +
    
    '.mode-switcher { background: #f1f5f9; padding: 4px; border-radius: 8px; display: inline-flex; width: fit-content; }' +
    '.mode-btn { border: none; background: transparent; padding: 6px 16px; border-radius: 9999px; font-family: "Space Grotesk", sans-serif; font-size: 13px; font-weight: 500; color: #0f172a; cursor: pointer; transition: all 0.2s; }' +
    '.mode-btn:hover { color: #0f172a; }' +
    '.mode-btn.active { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 600; }' +

    '.category-section { margin-bottom: 16px; }' +
    '.category-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer; user-select: none; }' +
    '.category-toggle { color: #64748b; display: flex; align-items: center; }' +
    '.category-badge { padding: 5px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }' +
    '.category-count { color: #64748b; font-size: 11px; }' +
    '.category-content { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }' +
    '.category-content.hidden { display: none; }' +
    
    '.param-item { display: flex; flex-direction: column; gap: 4px; }' +
    '.param-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #1e293b; }' +
    '.param-flag { font-family: monospace; font-size: 10px; color: #64748b; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }' +
    '.param-desc { font-size: 11px; color: #64748b; line-height: 1.4; }' +
    '.param-input { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; color: #1e293b; font-size: 13px; width: 100%; box-sizing: border-box; font-family: "Space Grotesk", sans-serif; }' +
    '.param-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }' +
    '.param-textarea { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; color: #1e293b; font-size: 13px; width: 100%; box-sizing: border-box; font-family: "Space Grotesk", sans-serif; resize: vertical; }' +
    '.param-textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }' +
    '.param-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; }' +
    '.checkbox-input { width: 18px; height: 18px; accent-color: #6366f1; cursor: pointer; }' +
    
    '.sidebar-panel { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; height: fit-content; }' +
    '.sidebar-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }' +
    '.switch-container { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }' +
    '.switch-container:last-child { border-bottom: none; }' +
    '.switch-label { font-size: 13px; font-weight: 500; color: #0f172a; }' +
    '.switch-wrapper { position: relative; display: inline-block; width: 36px; height: 20px; }' +
    '.switch-wrapper input { opacity: 0; width: 0; height: 0; }' +
    '.switch-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }' +
    '.switch-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }' +
    'input:checked + .switch-slider { background-color: #0f172a; }' +
    'input:checked + .switch-slider:before { transform: translateX(16px); }' +
    
    // Multiselect styles
    '.multiselect-container { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }' +
    '.multiselect-label { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }' +
    '.multiselect-desc { font-size: 11px; color: #64748b; margin-bottom: 8px; }' +
    '.multiselect-tags { min-height: 36px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; display: flex; flex-wrap: wrap; gap: 6px; cursor: pointer; }' +
    '.multiselect-tags:hover { border-color: #6366f1; }' +
    '.multiselect-placeholder { color: #94a3b8; font-size: 12px; }' +
    '.multiselect-tag { background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }' +
    '.tag-remove { cursor: pointer; opacity: 0.7; display: flex; }' +
    '.tag-remove:hover { opacity: 1; }' +
    '.multiselect-dropdown { display: none; position: absolute; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 100; margin-top: 4px; width: 100%; }' +
    '.multiselect-dropdown.show { display: block; }' +
    '.multiselect-option { padding: 8px 12px; font-size: 12px; cursor: pointer; }' +
    '.multiselect-option:hover { background: #f1f5f9; }' +
    '.multiselect-container { position: relative; }' +
    
    '.command-section { margin-top: 24px; padding: 16px; background: #1e293b; border-radius: 10px; }' +
    '.command-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }' +
    '.command-title { font-size: 13px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px; }' +
    '.command-output { font-family: monospace; font-size: 12px; color: #4ade80; white-space: pre-wrap; word-break: break-all; margin-bottom: 16px; }' +
    '.btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; font-family: "Space Grotesk", sans-serif; transition: 0.2s; }' +
    '.btn-primary { background: #6366f1; color: white; }' +
    '.btn-primary:hover { background: #4f46e5; }' +
    '.btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }' +
    '.btn-secondary:hover { background: rgba(255,255,255,0.2); }' +
    '.status-badge { padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }' +
    '.status-ready { background: #dcfce7; color: #166534; }' +
    '.status-missing { background: #fef3c7; color: #b45309; }' +
    
    '.sheet-table-container { display: none; margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }' +
    '.sheet-table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }' +
    '.sheet-table-title { font-size: 14px; font-weight: 700; color: #1e293b; }' +
    '.sheet-table-wrapper { overflow-x: auto; max-height: 400px; overflow-y: auto; }' +
    '.sheet-table { width: 100%; border-collapse: collapse; font-size: 12px; }' +
    '.sheet-table th { background: #1e293b; color: #fff; padding: 8px 6px; text-align: left; font-weight: 600; position: sticky; top: 0; z-index: 10; white-space: nowrap; }' +
    '.sheet-table td { padding: 4px; border-bottom: 1px solid #e2e8f0; }' +
    '.sheet-cell-input { width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; font-size: 12px; font-family: "Space Grotesk", sans-serif; }' +
    '.sheet-cell-input:focus { outline: none; border-color: #6366f1; }' +
    '.sheet-action-cell { width: 40px; text-align: center; }' +
    '.btn-icon-small { background: transparent; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; color: #64748b; transition: color 0.2s; }' +
    '.btn-icon-small:hover { color: #ef4444; }' +
    '.btn-add-row:hover { background: #4f46e5; }' +
    '.status-indicator { margin-top: 16px; padding: 12px 16px; border-radius: 8px; display: none; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; }' +
    '.status-indicator.show { display: flex; }' +
    '.status-installing { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }' +
    '.status-running { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }' +
    '.status-finished { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }' +
    '.status-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }' +
    '.spinner-icon { animation: spin 1s linear infinite; }' +
    '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';

    el.innerHTML = '<style>' + styles + '</style>';

    // --- RENDER ---
    const launcher = document.createElement('div');
    launcher.className = 'hoodini-launcher';

    // 1. Header with Mode Switcher
    const header = document.createElement('div');
    header.className = 'hoodini-header';
    
    const topRow = document.createElement('div');
    topRow.className = 'header-top';
    topRow.innerHTML = 
        '<div><div class="hoodini-logo">' + icons.dna + '<span class="hoodini-title">Hoodini Launcher</span></div>' +
        '<div class="hoodini-subtitle" style="margin-left: 32px">Magic gene-neighborhood analyses</div></div>' +
        '<span class="status-badge status-missing">' + icons.alert + ' Input required</span>';
    
    const modeRow = document.createElement('div');
    modeRow.className = 'mode-switcher';
    ['Single Input', 'Input List', 'Input Sheet'].forEach((m, idx) => {
        const key = ['single', 'list', 'sheet'][idx];
        const btn = document.createElement('button');
        btn.className = 'mode-btn' + (key === currentMode ? ' active' : '');
        btn.textContent = m;
        btn.onclick = () => {
            currentMode = key;
            el.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateVisibility();
        };
        modeRow.appendChild(btn);
    });
    header.appendChild(topRow);
    header.appendChild(modeRow);
    launcher.appendChild(header);

    // Sheet Table (for Input Sheet mode)
    const sheetTableContainer = document.createElement('div');
    sheetTableContainer.className = 'sheet-table-container';
    
    const sheetHeader = document.createElement('div');
    sheetHeader.className = 'sheet-table-header';
    sheetHeader.innerHTML = '<div class="sheet-table-title">Input Sheet Data</div>';
    
    const btnAddRow = document.createElement('button');
    btnAddRow.className = 'btn btn-primary';
    btnAddRow.innerHTML = icons.plus + ' Add Row';
    btnAddRow.onclick = () => addSheetRow();
    sheetHeader.appendChild(btnAddRow);
    sheetTableContainer.appendChild(sheetHeader);
    
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'sheet-table-wrapper';
    
    const table = document.createElement('table');
    table.className = 'sheet-table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    sheetColumns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    const thAction = document.createElement('th');
    thAction.textContent = 'Actions';
    headerRow.appendChild(thAction);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    tableWrapper.appendChild(table);
    sheetTableContainer.appendChild(tableWrapper);
    
    // Add paste handler
    tableWrapper.addEventListener('paste', handleSheetPaste);
    
    launcher.appendChild(sheetTableContainer);

    // 2. Grid Content
    const grid = document.createElement('div');
    grid.className = 'hoodini-grid';

    // Left Column: Main Params
    const mainCol = document.createElement('div');
    mainCol.className = 'main-col';
    
    const collapsedState = {};

    Object.entries(params).forEach(([category, paramList]) => {
        if (category === 'Annotations' || category === 'Links') return; // Goes to sidebar
        
        const section = document.createElement('div');
        section.className = 'category-section';
        section.setAttribute('data-category', category);
        
        const style = categoryStyles[category] || { bg: '#f1f5f9', text: '#475569' };
        collapsedState[category] = (category !== 'Input/Output');
        
        const catHeader = document.createElement('div');
        catHeader.className = 'category-header';
        catHeader.innerHTML = 
            '<span class="category-toggle">' + (collapsedState[category] ? icons.chevronRight : icons.chevronDown) + '</span>' +
            '<span class="category-badge" style="background: ' + style.bg + '; color: ' + style.text + '">' + category + '</span>' +
            '<span class="category-count">' + paramList.length + ' options</span>';
            
        const content = document.createElement('div');
        content.className = 'category-content' + (collapsedState[category] ? ' hidden' : '');
        
        paramList.forEach(param => {
            content.appendChild(createInput(param));
        });
        
        catHeader.onclick = () => {
            collapsedState[category] = !collapsedState[category];
            content.classList.toggle('hidden', collapsedState[category]);
            const toggle = catHeader.querySelector('.category-toggle');
            toggle.innerHTML = collapsedState[category] ? icons.chevronRight : icons.chevronDown;
        };
        
        section.appendChild(catHeader);
        section.appendChild(content);
        mainCol.appendChild(section);
    });
    grid.appendChild(mainCol);

    // Right Column: Annotations + Links Sidebar
    const sidebarCol = document.createElement('div');
    sidebarCol.className = 'sidebar-col';
    
    // Annotations Section
    const annotStyle = categoryStyles['Annotations'] || { bg: '#f1f5f9', text: '#475569' };
    const annotSection = document.createElement('div');
    annotSection.className = 'category-section';
    annotSection.setAttribute('data-category', 'Annotations');
    const annotHeader = document.createElement('div');
    annotHeader.className = 'category-header';
    annotHeader.innerHTML = '<span class="category-toggle">' + icons.chevronDown + '</span>' + '<span class="category-badge" style="background: ' + annotStyle.bg + '; color: ' + annotStyle.text + '">Annotations</span>' + '<span class="category-count">' + (params['Annotations'] ? params['Annotations'].length : 0) + ' options</span>';
    const annotContent = document.createElement('div');
    annotContent.className = 'sidebar-panel';
    
    if (params['Annotations']) {
        params['Annotations'].forEach(param => {
            if (param.type === 'bool' || param.type === 'switch') {
                annotContent.appendChild(createSwitch(param));
            } else if (param.type === 'multiselect') {
                annotContent.appendChild(createMultiSelect(param));
            } else {
                const wrap = document.createElement('div');
                wrap.style.marginTop = '12px';
                wrap.appendChild(createInput(param));
                annotContent.appendChild(wrap);
            }
        });
    }
    
    annotHeader.onclick = () => {
        annotContent.classList.toggle('hidden');
        const toggle = annotHeader.querySelector('.category-toggle');
        toggle.innerHTML = annotContent.classList.contains('hidden') ? icons.chevronRight : icons.chevronDown;
    };
    
    annotSection.appendChild(annotHeader);
    annotSection.appendChild(annotContent);
    sidebarCol.appendChild(annotSection);
    
    // Links Section
    const linksStyle = categoryStyles['Links'] || { bg: '#f1f5f9', text: '#475569' };
    const linksSection = document.createElement('div');
    linksSection.className = 'category-section';
    linksSection.setAttribute('data-category', 'Links');
    const linksHeader = document.createElement('div');
    linksHeader.className = 'category-header';
    linksHeader.innerHTML = '<span class="category-toggle">' + icons.chevronDown + '</span>' + '<span class="category-badge" style="background: ' + linksStyle.bg + '; color: ' + linksStyle.text + '">Links</span>' + '<span class="category-count">' + (params['Links'] ? params['Links'].length : 0) + ' options</span>';
    const linksContent = document.createElement('div');
    linksContent.className = 'sidebar-panel';
    
    if (params['Links']) {
        params['Links'].forEach(param => {
            if (param.type === 'bool' || param.type === 'switch') {
                linksContent.appendChild(createSwitch(param));
            } else {
                const wrap = document.createElement('div');
                wrap.style.marginTop = '12px';
                wrap.appendChild(createInput(param));
                linksContent.appendChild(wrap);
            }
        });
    }
    
    linksHeader.onclick = () => {
        linksContent.classList.toggle('hidden');
        const toggle = linksHeader.querySelector('.category-toggle');
        toggle.innerHTML = linksContent.classList.contains('hidden') ? icons.chevronRight : icons.chevronDown;
    };
    
    linksSection.appendChild(linksHeader);
    linksSection.appendChild(linksContent);
    sidebarCol.appendChild(linksSection);
    
    grid.appendChild(sidebarCol);
    launcher.appendChild(grid);

    // 3. Command Footer
    const cmdSection = document.createElement('div');
    cmdSection.className = 'command-section';
    cmdSection.innerHTML = 
        '<div class="command-header">' +
            '<div class="command-title">' + icons.terminal + ' Generated Command</div>' +
            '<div class="btn-group" style="display:flex; gap:8px">' +
    
    // Status Indicator
                '<button id="copy-btn" class="btn btn-secondary">' + icons.copy + ' Copy</button>' +
                '<button id="reset-btn" class="btn btn-secondary">' + icons.refresh + ' Reset</button>' +
            '</div>' +
        '</div>' +
        '<pre class="command-output">hoodini run</pre>' +
        '<button id="run-btn" class="btn btn-primary" style="width:100%">' + icons.play + ' Run Hoodini Analysis</button>';
    launcher.appendChild(cmdSection);
    
    // Status Indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';
    statusIndicator.id = 'status-indicator';
    launcher.appendChild(statusIndicator);
    
    el.appendChild(launcher);
    
    // Listen for status changes from Python
    model.on('change:status_state', () => {
        const state = model.get('status_state');
        const message = model.get('status_message');
        const indicator = el.querySelector('#status-indicator');
        
        if (state === 'idle') {
            indicator.classList.remove('show');
            indicator.className = 'status-indicator';
        } else {
            indicator.classList.add('show');
            indicator.className = 'status-indicator show';
            
            if (state === 'installing') {
                indicator.classList.add('status-installing');
                indicator.innerHTML = icons.spinner + ' <strong>Installing:</strong> ' + message;
            } else if (state === 'running') {
                indicator.classList.add('status-running');
                indicator.innerHTML = icons.spinner + ' <strong>Running:</strong> ' + message;
            } else if (state === 'finished') {
                indicator.classList.add('status-finished');
                indicator.innerHTML = icons.check + ' <strong>Finished!</strong> ' + message;
            } else if (state === 'error') {
                indicator.classList.add('status-error');
                indicator.innerHTML = icons.alert + ' <strong>Error:</strong> ' + message;
            }
        }
    });

    // Handlers
    el.querySelector('#copy-btn').onclick = function() {
        const cmd = buildCommand();
        navigator.clipboard.writeText(cmd);
        const btn = el.querySelector('#copy-btn');
        btn.innerHTML = icons.check + ' Copied';
        setTimeout(() => { btn.innerHTML = icons.copy + ' Copy'; }, 2000);
    };

    el.querySelector('#run-btn').onclick = () => {
        model.set('run_requested', true);
        model.save_changes();
    };

    el.querySelector('#reset-btn').onclick = () => {
        Object.keys(state).forEach(k => delete state[k]);
        Object.keys(multiSelectState).forEach(k => multiSelectState[k] = []);
        Object.values(params).flat().forEach(p => {
            if (p.def !== undefined) state[p.name] = p.def;
        });
        
        el.querySelectorAll('input:not([type="checkbox"]), select').forEach(input => input.value = '');
        el.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
        el.querySelectorAll('.multiselect-tags').forEach(container => {
            container.innerHTML = '<span class="multiselect-placeholder">Click to select databases...</span>';
        });

        updateCommand();
    };
    
    // Initialize with one empty row for sheet mode
    addSheetRow();
    updateVisibility();
    model.set('command', buildCommand());
    model.save_changes();
}
export default { render };