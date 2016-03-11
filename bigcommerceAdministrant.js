/*
 Author      : Angelin L. Nadar nadarangel@gmail.com
 Description : This is the core file of the product.
 Disclaimer  : This product has known bugs/optimizations. This prouct is a built as a prototype and solely to establish the idea of the product.
 */

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
    'Ext.form.*'
]);
if (window.location.search.indexOf('scopecss') !== -1) {
// We are using ext-all-scoped.css, so all rendered ExtJS Components must have a
// reset wrapper round them to provide localized CSS resetting.
    Ext.scopeResetCSS = true;
}



Ext.onReady(function () {
    var iconUrl = 'resources/icons/';
    Ext.QuickTips.init();

//BOF Models
    Ext.define('Product', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'description', type: 'string'},
            {name: 'size'},
            {name: 'price', type: 'float'},
            {name: 'quantity', type: 'int'},
            {name: 'isVisible', type: 'Boolean'},
            {name: 'freeshipping', type: 'Boolean'},
            {name: 'featured', type: 'Boolean'}
        ]
    });
    Ext.define('Order', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'datetime', type: 'date', dateFormat: 'd/m/Y H:i:s'},
            {name: 'amount', type: 'float'},
            {name: 'details', type: 'string'},
            {name: 'status', type: 'string'}
        ]
    });

    Ext.define('Customer', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'email', type: 'string'},
            {name: 'last_order_date', type: 'date', dateFormat: 'd/m/Y H:i:s'},
            {name: 'last_order_amount', type: 'float'},
            {name: 'last_order_details', type: 'string'},
            {name: 'total_orders', type: 'int'},
            {name: 'total_amount', type: 'int'}
        ]
    });

    var operatorStore = Ext.create('Ext.data.Store', {
        fields: ['name', 'value'],
        data: [
            {name: 'Greater than or Equal to', value: '>='},
            {name: 'Lesser than or Equal to', value: '<='},
            {name: 'Equal to', value: '=='},
            {name: 'Not Equal to', value: 'Not Equal To!='}
        ]
    });

    var searchColumnStore = Ext.create('Ext.data.Store', {
        fields: ['name', 'value'],
        data: [
            {name: 'Name', value: 'name'},
            {name: 'Price', value: 'price'},
            {name: 'Size', value: 'size'},
        ]
    });
//EOF Models

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
                //@todo to be optimized by delaying the keyup event
                var searchText = this.value;
                // Clear the filter collection without updating the UI
                BI.currentStore.clearFilter(true);
                if (searchText == '') {
                    BI.currentStore.load({
                        params: {
                            // @todo specify params for the first page load if using paging
                            start: 0,
                            limit: BI.pagesize
                        }
                    });
                    return;
                }
                BI.currentStore.filter([
                    {filterFn: function (item) {
                            var pattern = new RegExp(searchText, "i");
                            var result = false;
                            for (var i in BI.currentColumns) {
                                result = (result || (pattern.test(item.get(BI.currentColumns[i].dataIndex))));
                                if (result == true)
                                    return result;
                            }
                            return result;
                        }}
                ]);
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
        //paging settings


        administrant.reconfigure(BI.currentStore, BI.currentColumns);
        var pagingToolbar = administrant.getDockedItems('pagingtoolbar')[0];
        pagingToolbar.bind(BI.currentStore);
        BI.currentStore.load();  //pagination gets updated
    };
    // BOF config for Product 
    BI.products = {
        store: Ext.create('Ext.data.Store', {
            autoLoad: true,
            model: 'Product',
            proxy: {
                type: 'ajax',
                // load remote data using HTTP
                url: 'products.json',
                // specify a jsonReader (coincides with the json format of the returned data)
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
                header: 'Quantity',
                dataIndex: 'quantity',
                align: 'right'
            },
            {
                xtype: 'checkcolumn',
                header: 'Visible?',
                dataIndex: 'isVisible',
                renderer: function (val, m, rec) {
                    if (rec.get('isVisible') == false)
                        return (new Ext.ux.CheckColumn()).renderer();
                    else
                        return (new Ext.ux.CheckColumn()).renderer(val);
                }
            },
            {
                xtype: 'checkcolumn',
                header: 'Free Shipping',
                dataIndex: 'freeshipping',
                renderer: function (val, m, rec) {
                    if (rec.get('freeShipping') == false)
                        return (new Ext.ux.CheckColumn()).renderer();
                    else
                        return (new Ext.ux.CheckColumn()).renderer(val);
                }
            },
            {
                xtype: 'checkcolumn',
                header: 'Is Featured?',
                dataIndex: 'featured',
                renderer: function (val, m, rec) {
                    if (rec.get('isFeatured') == false)
                        return (new Ext.ux.CheckColumn()).renderer();
                    else
                        return (new Ext.ux.CheckColumn()).renderer(val);
                }
            },
            {
                xtype: 'actioncolumn',
                sortable: false,
                width: 40,
                items: [{
                        icon: 'resources/icons/delete.gif',
                        tooltip: 'Delete Plant',
                        handler: function (grid, rowIndex, colIndex) {
                            Ext.MessageBox.confirm('Delete', 'Are you sure ?', function (btn) {
                                if (btn === 'yes') {
                                    grid.store.removeAt(rowIndex);
                                }
                            });

                        }
                    }]
            }
        ]
    }
// EOF Config of product

// BOF Config of Orders
    BI.orders = {
        store: Ext.create('Ext.data.Store', {
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
            }
        ]
    }
// EOF Config of Orders

//BOF of Customers
    BI.customers = {
        store: Ext.create('Ext.data.Store', {
            autoLoad: true,
            model: 'Customer',
            proxy: {
                type: 'ajax',
                // load remote data using HTTP
                url: 'customers.json',
                // specify a jsonReader (coincides with the Json format of the returned data)
                reader: {
                    type: 'json',
                    root: 'rows'
                }
            },
            sorters: [{
                    property: 'last_order_date',
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
                id: 'email',
                header: 'Email',
                dataIndex: 'email',
                flex: 0.5,
                editor: {
                    allowBlank: false
                }
            },
            {
                header: 'Last Order Date',
                dataIndex: 'last_order_date',
                flex: 0.5,
                renderer: Ext.util.Format.dateRenderer('d/m/Y H:i:s')
            },
            {
                id: 'last_order_amount',
                header: 'Last Order Amount',
                dataIndex: 'last_order_amount',
                renderer: 'usMoney',
                width: 95,
            },
            {
                id: 'last_order_details',
                header: 'Last Order Details',
                dataIndex: 'last_order_details',
                width: 95,
            }
            , {
                header: 'Total Orders',
                dataIndex: 'total_orders',
            }, {
                header: 'Total Amount',
                dataIndex: 'total_amount',
                renderer: 'usMoney'
            }
        ]
    }
// EOF of Customers


// BOF Main Menu
    BI.mainMenu = new Ext.form.field.ComboBox({
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
        listClass: 'x-combo-list-small',
                listeners: {
                    select: function () {
                        //when am option is selected from the main menu
                        BI.activeModule = this.value;
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

                        if (BI.activeModule != 'products') {
                            Ext.getCmp('isvisible').hide();
                            Ext.getCmp('freeshipping').hide();
                            Ext.getCmp('outofstock').hide();
                        } else {
                            Ext.getCmp('isvisible').show();
                            Ext.getCmp('freeshipping').show();
                            Ext.getCmp('outofstock').show();
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
        store: '',
        selModel: BI.selectionChechboxModel,
        columns: BI.products.columns,
        renderTo: 'editor-grid',
        icon: iconUrl + 'administrant.gif',
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
                id: 'advance-search-column',
                store: searchColumnStore,
                emptyText: 'Choose Column',
                displayField: 'name',
                valueField: 'value',
                lazyRender: true,
                listClass: 'x-combo-list-small'
            },
            {
                xtype: 'combobox',
                typeAhead: true,
                triggerAction: 'all',
                selectOnTab: true,
                id: 'advance-search-operator',
                store: operatorStore,
                emptyText: 'Choose Operator',
                displayField: 'name',
                valueField: 'value',
                lazyRender: true,
                listClass: 'x-combo-list-small'
            },
            {
                xtype: 'textfield',
                id: 'advance-search',
                emptyText: 'Enter value'
            },
            {
                text: 'Search',
                id: 'search',
                handler: function () {
                    var column = Ext.getCmp('advance-search-column').value, operator = Ext.getCmp('advance-search-operator').value, searchValue = Ext.getCmp('advance-search').value;
                    BI.currentStore.clearFilter();
                    BI.currentStore.filter([
                        {filterFn: function (item) {
                                var t = false;
                                switch (operator) {
                                    case '>=':
                                        t = (item.get(column) >= searchValue);
                                        break;
                                    case '<=':
                                        t = (item.get(column) <= searchValue);
                                        break;
                                    case '>':
                                        t = (item.get(column) > searchValue);
                                        break;
                                    case '<':
                                        t = (item.get(column) < searchValue);
                                        break;
                                    case '!=':
                                        t = (item.get(column) != searchValue);
                                        break;
                                    case '==':
                                        t = (item.get(column) == searchValue);
                                        break;
                                    default:
                                        t = false;
                                        break;
                                }
                                return t;
                            }}
                    ]);

                }
            },
            {
                xtype: 'checkbox',
                hideLabel: true,
                margin: '0 0 0 4px',
                text: 'Advance Search',
                handler: function () {
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
                }}, 'Advance Search',
            {
                xtype: 'checkbox',
                id: 'isvisible',
                text: 'Visible',
                boxLabel: 'Visible',
                dataIndex: 'isVisible',
                handler: function () {
                    var visibleChecked = this.checked;
                    BI.currentStore.clearFilter();
                    BI.currentStore.filter([
                        {filterFn: function (item) {
                                return ((visibleChecked == true) ? (item.get('isVisible') == true) : (item.get('isVisible') == false));
                            }
                        }]);
                }},
            {
                xtype: 'checkbox',
                id: 'freeshipping',
                boxLabel: 'Free Shipping',
                text: 'Free Shipping',
                dataIndex: 'freeshipping',
                handler: function () {
                    var freeShippingChecked = this.checked;
                    BI.currentStore.clearFilter();
                    BI.currentStore.filter([
                        {filterFn: function (item) {
                                return ((freeShippingChecked == true) ? (item.get('freeshipping') == true) : (item.get('freeshipping') == false));
                            }
                        }]);

                }},
            {
                xtype: 'checkbox',
                id: 'outofstock',
                boxLabel: 'Out of Stock',
                dataIndex: 'quantity',
                handler: function () {
                    var outofstockChecked = this.checked;
                    BI.currentStore.clearFilter();
                    BI.currentStore.filter([
                        {filterFn: function (item) {
                                return ((outofstockChecked == true) ? (item.get('quantity') == 0) : (item.get('quantity') >= 0));
                            }
                        }]);

                }}],
        plugins: [cellEditing],
        dockedItems: [{
                xtype: 'pagingtoolbar',
                store: BI.currentStore, // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true,
                items: ['->', {xtype: 'tbseparator', idid: 'beforeBatchSeparator'}, {
                        text: 'Add Product',
                        icon: iconUrl + 'add.png',
                        handler: function () {
                            // adding product
                            var r = Ext.create('Product', {
                                name: 'New Product',
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
                        icon: iconUrl + 'save.gif',
                        handler: function () {
                            BI.saveRecords();
                        }
                    }, {
                        text: 'Batch Delete',
                        icon: iconUrl + 'delete.gif',
                        handler: function () {
                            var selectedRecords = administrant.getSelectionModel().getSelection();
                            Ext.each(selectedRecords, function (item) {

                                Ext.MessageBox.confirm('Delete', 'Are you sure ?', function (btn) {
                                    if (btn === 'yes') {
                                        administrant.store.remove(item);
                                        showMessage('Message', selectedRecords.length + ' Record(s) deleted successfully');
                                    }
                                });

                            });
                        }
                    }, {
                        text: 'Batch Update',
                        icon: iconUrl + 'save.gif',
                        handler: function () {
                            var selectedRecords = administrant.getSelectionModel().getSelection();
                            Ext.each(selectedRecords, function (item) {
                                administrant.store.remove(item);
                                showMessage('Message', 'Can be used in future to bulk update products or give discounts');
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
    Ext.getCmp('advance-search-column').hide();
    Ext.getCmp('advance-search-operator').hide();
    Ext.getCmp('advance-search').hide();
});

