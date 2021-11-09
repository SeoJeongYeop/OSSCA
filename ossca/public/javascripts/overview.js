$(document).ready(function () {
  $('#scoreTable').DataTable({
    searchPanes: {
      viewTotal: true,
      orderable: false,
      columns: [2, 3, 4, 5, 6, 7],
      initCollapsed: true,
    },
    dom: 'Pfrtip',
    columnDefs: [
      {
        orderable: false,
        targets:[2]
      },
      {
        searchPanes: {
          options:[
            {
              label:'0 ~ 0.5',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 0 && Number(rowData[3]) <= 0.5
              }
            },
            {
              label:'0.5 ~ 1.0',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 0.5 && Number(rowData[3]) <= 1.0
              }
            },
            {
              label:'1.0 ~ 1.5',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 1.0 && Number(rowData[3]) <= 1.5
              }
            },
            {
              label:'1.5 ~ 2.0',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 1.5 && Number(rowData[3]) <= 2.0
              }
            },
            {
              label:'2.0 ~ 2.5',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 2.0 && Number(rowData[3]) <= 2.5
              }
            },
            {
              label:'2.5 ~ 3.0',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 2.5 && Number(rowData[3]) <= 3.0
              }
            },
            {
              label:'3.0 ~ 3.5',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 3.0 && Number(rowData[3]) <= 3.5
              }
            },
            {
              label:'3.5 ~ 4.0',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 3.5 && Number(rowData[3]) <= 4.0
              }
            },
            {
              label:'4.0 ~ 4.5',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 4.0 && Number(rowData[3]) <= 4.5
              }
            },
            {
              label:'4.5 ~ 5.0',
              value: function(rowData, rowIdx){
                return Number(rowData[3]) > 4.5 && Number(rowData[3]) <= 5.0
              }
            }
          ]
        },
        targets:[3]
      }
    ],
    order: [[3, 'desc']]
  });
});