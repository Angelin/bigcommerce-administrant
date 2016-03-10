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

    Ext.define('Product', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'small'},
            {name: 'price', type: 'float'},
            {name: 'availDate', mapping: 'availability', type: 'date', dateFormat: 'm/d/Y'}
        ]
    });


    // create the Data Store


    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });

//    checkboxes for rows
    var BI = {};
    BI.selectionChechboxModel = Ext.create('Ext.selection.CheckboxModel')
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
                    BI.currentStore.load();
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
    var showSelectedMenuView = function () {
//        pagingToolbar.bind(BI.currentStore);
        administrant.reconfigure(BI.currentStore, BI.currentColumns);
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
                    // records will have a 'plant' tag
                    root: 'rows'
                }
            },
            sorters: [{
                    property: 'common',
                    direction: 'ASC'
                }]
        }),
        columns: [{
                id: 'common',
                header: 'Common Name',
                dataIndex: 'name',
                flex: 1,
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
                width: 95,
                renderer: formatDate,
                editor: {
                    xtype: 'datefield',
                    format: 'm/d/y',
                    minValue: '01/01/06',
                    disabledDays: [0, 6],
                    disabledDaysText: 'Plants are not available on the weekends'
                }
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
                        icon: 'extjs_4_1_1/resources/icons/delete.gif',
                        tooltip: 'Delete Plant',
                        handler: function (grid, rowIndex, colIndex) {
                            store.removeAt(rowIndex);
                        }
                    }]
            }
        ]
    }
    // EOF Config of product

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
                console.debug(this.value);
                if (BI.activeModule == 'Orders') {
                    // code the necessary for orders
//                    BI.currentStore = ordersStore;
//                    BI.currentColumns = BI.products.columns;
                } else if (BI.activeModule == 'products') {
                    BI.currentStore = BI.products.store;
                    BI.products.store.load();
                    BI.currentColumns = BI.products.columns;
                } else {
                    // code the necessary for customer
//                    BI.currentStore = customersStore;
//                    BI.currentColumns = BI.customers.columns;
                }

                showSelectedMenuView();
            }
        }
    });
    // EOF Main Menu

    // create the grid and specify what field you want
    // to use for the editor at each header.
//    BI.currentStore = BI.products.store;
    var administrant = Ext.create('Ext.grid.Panel', {
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
            {
                text: 'Add Product',
                handler: function () {
                    // adding product
                    var r = Ext.create('Plant', {
                        common: 'New Plant 1',
                        light: 'Mostly Shady',
                        price: 0,
                        availDate: Ext.Date.clearTime(new Date()),
                        indoor: false
                    });
                    store.insert(0, r);
                    cellEditing.startEditByPosition({row: 0, column: 0});
                }
            }],
        plugins: [cellEditing]
    });
    BI.mainMenu.fireEvent('select', BI.mainMenu);
});

