var pagingToolbar = new Ext.PagingToolbar({
    id: 'pagingToolbar',
    items: ['->', {xtype: 'tbseparator', id: 'beforeBatchSeparator'},
        {
            text: getText('Batch Update'),
            tooltip: getText('Update selected items'),
            icon: iconURL+'save.png',
            id: 'batchUpdateButton',
            disabled: true,
            ref: 'batchButton',
            scope: this,
            listeners: {
                click: function () {
                }
            }
        }, {xtype: 'tbseparator', id: 'beforeSaveSeparator'}, {
            text: getText('Save'),
            tooltip: getText('Save all Changes'),
            icon: iconURL + 'save.png',
            disabled: true,
            scope: this,
            ref: 'saveButton',
            id: 'saveButton',
            listeners: {click: function () {

                }}
        }, {xtype: 'tbseparator', id: 'beforeExportSeparator'},
        {
            text: getText('Export CSV'),
            tooltip: getText('Download CSV file'),
            icon: iconURL + 'export_csv.gif',
            id: 'exportCsvButton',
            ref: 'exportButton',
            disabled: sm_disabled_lite(),
            scope: this,
            listeners: {
                click: function () {
                }
            }
        }],
    pageSize: limit,
    store: productsStore,
    displayInfo: true,
    style: {width: '100%'},
    hideBorders: true,
    align: 'center',
    displayMsg: 'Displaying {0} - {1} of {2}',
    emptyMsg: BI.activeModule + ' ' + getText('list is empty')
});