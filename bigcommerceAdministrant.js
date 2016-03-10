Ext.Loader.setConfig({
    enabled: true
});
Ext.Loader.setPath('Ext.ux', '../ux');
Ext.require([
    'Ext.selection.CellModel',
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
//    'Ext.grid.ColumnModel',
//    'Ext.ux.CheckColumn'
]);
if (window.location.search.indexOf('scopecss') !== -1) {
// We are using ext-all-scoped.css, so all rendered ExtJS Components must have a
// reset wrapper round them to provide localized CSS resetting.
    Ext.scopeResetCSS = true;
}



Ext.onReady(function () {
    Ext.QuickTips.init();
    function formatDate(value) {
        return value ? Ext.Date.dateFormat(value, 'M d, Y') : '';
    }

//BOF Models
    Ext.define('Product', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'size'},
            {name: 'price', type: 'float'},
            {name: 'availDate', type: 'date', dateFormat: 'd/m/Y'}
//            {name: 'availDate', type: 'string'}
        ]
    });
    Ext.define('Order', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'datetime', mapping: 'availability', type: 'date', dateFormat: 'd/m/Y H:i:s'},
            {name: 'amount', type: 'float'},
            {name: 'details', type: 'string'},
            {name: 'status', type: 'string'}
        ]
    });
//EOF Models


    // create the Data Store
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });
//    checkboxes for rows
    var BI = {};
    BI.pagesize = 2;
    BI.selectionChechboxModel = Ext.create('Ext.selection.CheckboxModel');
    var showMessage = function (title, msg) {
        Ext.Msg.show({
            title: title,
            msg: msg,
            modal: false,
            icon: Ext.Msg.INFO,
            buttons: Ext.Msg.OK
        });
    };
    BI.searchTextField = new Ext.form.TextField({
        id: 'searchTextField',
        width: 400,
        cls: 'searchPanel',
        style: {
            fontSize: '14px',
            paddingLeft: '2px',
            width: '100%'
        },
        params: {
            cmd: 'searchText'
        },
        emptyText: 'Search' + '...',
        enableKeyEvents: true,
        listeners: {
            keyup: function () {
                console.log('keyup');
                var searchText = this.value;
                // Clear the filter collection without updating the UI
                BI.currentStore.clearFilter(true);
                if (searchText == '') {
                    BI.currentStore.load({
                        params: {
                            // specify params for the first page load if using paging
                            start: 0,
                            limit: BI.pagesize
                        }
                    });
                    return;
                }
                console.log('BI.currentStore:', BI.currentStore);
                BI.currentStore.filter([
                    {filterFn: function (item) {
                            var result = false;
                            var pattern = new RegExp(searchText, "i");
                            for (i in BI.currentColumns) {
                                result = (result || (pattern.test(item.get(BI.currentColumns[i]))));
                            }

                            return result;
                        }}
                ]);
//                BI.currentStore.filter([
//                    {filterFn: function (item) {
//                            return item.get("name") == 'Product 1';
//                        }}
//                ]);
            }}
    });
    BI.mainMenuStore = Ext.create('Ext.data.Store', {
        data: [
            {"name": "Products", "value": "products"},
            {"name": "Orders", "value": "orders"},
            {"name": "Customers", "value": "customers"}
        ],
        fields: [
            {type: 'string', name: 'name'},
            {type: 'string', name: 'value'},
        ]
    });
    BI.showSelectedMenuView = function () {
//        pagingToolbar.bind(BI.currentStore);
        administrant.reconfigure(BI.currentStore, BI.currentColumns);
        BI.currentStore.load({
            params: {
                // specify params for the first page load if using paging
                start: 0,
                limit: BI.pagesize
            }
        });
//        fieldsStore.loadData(productsFields);
    };
    // BOF config for Product 
    BI.products = {
        store: Ext.create('Ext.data.Store', {
            // destroy the store if the grid is destroyed
            autoDestroy: true,
            autoLoad: true,
            model: 'Product',
            proxy: {
                type: 'ajax',
                // load remote data using HTTP
                url: 'products.json',
                // specify a XmlReader (coincides with the XML format of the returned data)
                reader: {
                    type: 'json',
                    root: 'rows'
                }
            },
            sorters: [{
                    property: 'name',
                    direction: 'ASC'
                }]
        }),
        columns: [{
                id: 'name',
                header: 'Name',
                dataIndex: 'name',
                flex: 0.25,
                editor: {
                    allowBlank: false
                }
            }, {
                id: 'description',
                header: 'Description',
                dataIndex: 'description',
                flex: 0.25,
                editor: {
                    allowBlank: false
                }
            }, {
                header: 'Size',
                dataIndex: 'size',
                width: 130,
                editor: new Ext.form.field.ComboBox({
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    store: [
                        ['small', 'small'],
                        ['large', 'large'],
                    ],
                    lazyRender: true,
                    listClass: 'x-combo-list-small'
                })
            }, {
                header: 'Price',
                dataIndex: 'price',
                width: 70,
                align: 'right',
                renderer: 'usMoney',
                editor: {
                    xtype: 'numberfield',
                    allowBlank: false,
                    minValue: 0,
                    maxValue: 100000
                }
            },
            {
                header: 'Available',
                dataIndex: 'availDate',
                flex: 0.25,
                renderer: Ext.util.Format.dateRenderer('d/m/Y H:i:s')
            },
//            {
//                xtype: 'checkcolumn',
//                header: 'Visible?',
//                dataIndex: 'isVisible',
//                width: 55,
//                stopSelection: false
//            },
//            {
//           xtype: 'checkcolumn',
//           text: 'Active?',
////           dataIndex: 'status',
//           width: 55
//        },
            {
                xtype: 'actioncolumn',
                width: 60,
                sortable: false,
                items: [{
                        icon: 'resources/icons/delete.gif',
                        tooltip: 'Delete Plant',
                        handler: function (grid, rowIndex, colIndex) {
                            grid.store.removeAt(rowIndex);
                        }
                    }]
            }
        ]
    }
// EOF Config of product

// BOF Config of Orders
    BI.orders = {
        store: Ext.create('Ext.data.Store', {
// destroy the store if the grid is destroyed
            autoDestroy: true,
            autoLoad: true,
            model: 'Order',
            proxy: {
                type: 'ajax',
                // load remote data using HTTP
                url: 'orders.json',
                // specify a XmlReader (coincides with the XML format of the returned data)
                reader: {
                    type: 'json',
                    root: 'rows'
                }
            },
            sorters: [{
                    property: 'datetime',
                    direction: 'ASC'
                }]
        }),
        columns: [{
                id: 'name',
                header: 'Name',
                dataIndex: 'name',
                flex: 0.5,
                editor: {
                    allowBlank: false
                }
            },
            {
                header: 'Date / Time',
                dataIndex: 'datetime',
                flex: 0.5,
                renderer: Ext.util.Format.dateRenderer('d/m/Y H:i:s')
            },
            {
                id: 'amount',
                header: 'Amount',
                dataIndex: 'amount',
                renderer: 'usMoney',
                width: 95,
            }
            , {
                header: 'Status',
                dataIndex: 'status',
                width: 130,
                editor: new Ext.form.field.ComboBox({
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    store: [
                        ['Awaiting Shipment'],
                        ['Shipped'],
                        ['Shipped'],
                        ['Refunded'],
                        ['Decline'],
                    ],
                    lazyRender: true,
                    listClass: 'x-combo-list-small'
                })
            }, {
                header: 'Details',
                dataIndex: 'details',
            },
            {
                xtype: 'actioncolumn',
                width: 60,
                sortable: false,
                items: [{
                        icon: 'resources/icons/delete.gif',
                        tooltip: 'Delete Plant',
                        handler: function (grid, rowIndex, colIndex) {
                            grid.store.removeAt(rowIndex);
                        }
                    }]
            }
        ]
    }
// EOF Config of Orders


// BOF Main Menu
    BI.mainMenu = new Ext.form.field.ComboBox({
        fieldLabel: 'Choose a option',
        triggerAction: 'all',
        selectOnTab: true,
        store: BI.mainMenuStore,
        lazyRender: true,
        listClass: 'x-combo-list-small',
        queryMode: 'local',
        displayField: 'name',
        forceSelection: true,
        valueField: 'value',
        value: 'products',
        listeners: {
            select: function () {
                //when am option is selected from the main menu
                BI.activeModule = this.value;
                console.debug(BI.activeModule);
                if (BI.activeModule == 'orders') {
                    BI.currentStore = BI.orders.store;
                    BI.currentColumns = BI.orders.columns;
                } else if (BI.activeModule == 'products') {
                    BI.currentStore = BI.products.store;
                    BI.currentColumns = BI.products.columns;
                } else {
                    BI.currentStore = BI.customers.store;
                    BI.currentColumns = BI.customers.columns;
                }
                BI.showSelectedMenuView();
            }
        }
    });
    // EOF Main Menu

    // create the grid and specify what field you want
    // to use for the editor at each header.
    BI.currentStore = BI.products.store;
    var administrant = Ext.create('Ext.grid.Panel', {
        id: 'bigcommerce_administrant',
//        store: BI.products.store,
        store: '',
        selModel: BI.selectionChechboxModel,
        columns: BI.products.columns,
        renderTo: 'editor-grid',
        title: 'Bigcommerce Administrant',
        frame: true,
        emptyText: "No record found :(",
        tbar: [
            BI.mainMenu,
            BI.searchTextField,
            {xtype: 'combobox',
                typeAhead: true,
                triggerAction: 'all',
                selectOnTab: true,
                id: 'advance-search',
                store: [
                    ['Name', 'name'],
                    ['Price', 'price'],
                    ['Size', 'size']
                ],
                lazyRender: true,
                listClass: 'x-combo-list-small'
            },
            {
                xtype: 'combobox',
                typeAhead: true,
                triggerAction: 'all',
                selectOnTab: true,
                id: 'advance-search-operator',
                store: [
                    ['Greater than or Equal to', '>='],
                    ['Lesser than or Equal to', '<='],
                    ['Equal to', '=='],
                    ['Not Equal to', '!=']
                ],
                lazyRender: true,
                listClass: 'x-combo-list-small'
            },
            {
                xtype: 'textfield',
                id: 'advance-search'
            },
            {
                text: 'Search',
                id: 'simple-search',
                handler: function () {
                    BI.searchTextField.hide();
                }
            },
            {
                xtype: 'checkbox',
                text: 'Advance Search',
                handler: function () {
//                    var searchToolbar = administrant;
//                    console.debug('searchToolbar: ',searchToolbar);

                    if (this.text == 'Advance Search') {
                        BI.searchTextField.hide();
                        this.text = 'Simple Search';
                        Ext.getCmp('advance-search-column').show();
                        Ext.getCmp('advance-search-operator').show();
                        Ext.getCmp('advance-search').show();
                    } else {
                        BI.searchTextField.show(),
                        this.text = 'Advance Search';
                        Ext.getCmp('advance-search-column').hide();
                        Ext.getCmp('advance-search-operator').hide();
                        Ext.getCmp('advance-search').hide();
                    }
                }}],
        plugins: [cellEditing],
        dockedItems: [{
                xtype: 'pagingtoolbar',
                store: BI.currentStore, // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true,
                items: ['->', {xtype: 'tbseparator', idid: 'beforeBatchSeparator'}, {
                        text: 'Add Product',
                        handler: function () {
                            // adding product
                            var r = Ext.create('Product', {
                                name: 'New Entity',
                                descritpion: 'New descritpion',
                                size: 'small',
                                price: 0,
                                availDate: Ext.Date.clearTime(new Date())
                            });
                            BI.currentStore.insert(0, r);
                            cellEditing.startEditByPosition({row: 0, column: 0});
                        }
                    }, {
                        text: 'Save',
                        handler: function () {
                            BI.saveRecords();
                        }
                    }, {
                        text: 'Batch Delete',
                        handler: function () {
                            var selectedRecords = administrant.getSelectionModel().getSelection();
                            Ext.each(selectedRecords, function (item) {
                                administrant.store.remove(item);
                                showMessage('Message', selectedRecords.length + ' Record(s) deleted successfully');
                            });
                        }
                    }]
            }]

    });
    BI.mainMenu.fireEvent('select', BI.mainMenu);
    BI.saveRecords = function () {
        var s = administrant.getSelectionModel().getSelection();
        showMessage('Message', 'New records can be saved via Ajax Request');
    }
});

