/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.virtual.core.Pane",
{
  extend : qx.ui.core.Widget,


  construct : function(rowCount, columnCount, cellHeight, cellWidth)
  {
    this.base(arguments);
    
    this.rowConfig = new qx.ui.virtual.core.Axis(cellHeight, rowCount);
    this.columnConfig = new qx.ui.virtual.core.Axis(cellWidth, columnCount);
    
    this.__scrollTop = 0;
    this.__scrollLeft = 0;
    
    this.visibleCells = {};
    this.lastVisibleCells = {};
    
    this.__paneHeight = 0;
    this.__paneWidth = 0;
    
    // create layer container. The container does not have a layout manager
    // layers are positioned using "setUserBounds"
    this.__layerContainer = new qx.ui.container.Composite();
    this.__layerContainer.setUserBounds(0, 0, 0, 0);
    this._add(this.__layerContainer);
    
    this.layers = [];
    
    this.addListener("resize", this._onResize, this);
    this.addListener("appear", this._onResize, this);    
  },
   
  
  /*
   *****************************************************************************
      EVENTS
   *****************************************************************************
   */
  
  events :
  {
    /** Fired on resize of both the container or the (virtual) content. */
    "update" : "qx.event.type.Event",
    
    /** Dispatched when a data cell has been clicked. */
    "cellClick" : "qx.ui.table.pane.CellEvent",

    /** Dispatched when a data cell has been clicked. */
    "cellDblclick" : "qx.ui.table.pane.CellEvent",

    /** Dispatched when the context menu is needed in a data cell */
    "cellContextmenu" : "qx.ui.table.pane.CellEvent"  
  },
   
  
 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    width :
    {
      refine : true,
      init : 400
    },


    // overridden
    height :
    {
      refine : true,
      init : 300
    }     
  },   
   
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYER MANAGMENT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Returns the layer container
     *
     * @return {qx.ui.core.Widget} The layer container
     */
    getChild : function() {
      return this.__layerContainer;
    },
    
    
    addLayer : function(layer)
    {
      this.layers.push(layer);
      layer.setUserBounds(0, 0, 0, 0);
      this.__layerContainer.add(layer);
    },
    
    
    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * The maximum horizontal scroll position.
     *
     * @return {Integer} Maximum horizontal scroll position.
     */
    getScrollMaxX : function()
    {
      var paneSize = this.getBounds();

      if (paneSize) {
        return Math.max(0, this.columnConfig.getTotalSize() - paneSize.width);
      }

      return 0;
    },


    /**
     * The maximum vertical scroll position.
     *
     * @return {Integer} Maximum vertical scroll position.
     */
    getScrollMaxY : function()
    {
      var paneSize = this.getBounds();

      if (paneSize) {
        return Math.max(0, this.rowConfig.getTotalSize() - paneSize.height);
      }

      return 0;
    },    
    
    
    /**
     * Scrolls the content to the given left coordinate
     *
     * @param value {Integer} The vertical position to scroll to.
     */    
    setScrollY : function(value)
    {
      var max = this.getScrollMaxY();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      if (this.__scrollTop !== value)
      {
        this.__scrollTop = value;
        this.updateScrollPosition();
      }
    },
    
    
    /**
     * Returns the vertical scroll offset.
     * 
     * @return {Integer} The vertical scroll offset
     */
    getScrollY : function() {
      return this.__scrollTop;
    },
    
    
    /**
     * Scrolls the content to the given top coordinate
     *
     * @param value {Integer} The horizontal position to scroll to.
     */     
    setScrollX : function(value)
    {
      var max = this.getScrollMaxX();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      
      if (value !== this.__scrollLeft)
      {
        this.__scrollLeft = value;
        this.updateScrollPosition();
      }
    },

    
    /**
     * Returns the horizontal scroll offset.
     * 
     * @return {Integer} The horizontal scroll offset
     */    
    getScrollX : function() {
      return this.__scrollLeft;
    },

    
    /**
     * The (virtual) size of the content.
     *
     * @return {Map} Size of the content (keys: <code>width</code> and <code>height</code>)
     */
    getScrollSize : function() 
    {
      return {
        width: this.columnConfig.getTotalSize(),
        height: this.rowConfig.getTotalSize()
      }      
    },
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */
    
    _onResize : function() 
    {
      if (this.getContainerElement().getDomElement())
      {
        this.fullUpdate();
        this.fireEvent("update");
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      PANE UPDATE
    ---------------------------------------------------------------------------
    */
    
    __checkPaneResize : function()
    {
      var scrollSize = this.getScrollSize();
      if (
        this.__paneHeight !== scrollSize.height ||
        this.__paneWidth !== scrollSize.width
      ) 
      {
        this.__paneHeight = scrollSize.height;
        this.__paneWidth = scrollSize.width;  
        this.fireEvent("update");
      }      
    },
    
    
    fullUpdate : function()
    {
      if (this.layers.length == 0)
      {
        this.__checkPaneResize();
        return;
      }

      var bounds = this.getBounds();
      if (!bounds) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }            
     
      var rowCellData = this.rowConfig.getItemAtPosition(this.__scrollTop);
      var columnCellData = this.columnConfig.getItemAtPosition(this.__scrollLeft);
      
      var layerHeight = bounds.height; 
      if (rowCellData.offset) {
        layerHeight += this.rowConfig.getItemSize(rowCellData.index);
      }
      var layerWidth = bounds.width;
      if (columnCellData.offset) {
        layerWidth += this.columnConfig.getItemSize(columnCellData.index);
      }
      
      this.__layerContainer.setUserBounds(
        -columnCellData.offset, -rowCellData.offset, 
        layerWidth, layerHeight
      );
      
      var visibleCells = {
        firstRow: rowCellData.index,
        firstColumn: columnCellData.index
      }
      
      var rowSizes = this.rowConfig.getItemSizes(visibleCells.firstRow, bounds.height + rowCellData.offset);
      var columnSizes = this.columnConfig.getItemSizes(visibleCells.firstColumn, bounds.width + columnCellData.offset);

      visibleCells.lastRow = visibleCells.firstRow + rowSizes.length - 1;
      visibleCells.lastColumn = visibleCells.firstColumn + columnSizes.length - 1;
                  
      this.lastVisibleCells = this.visibleCells;
      this.visibleCells = visibleCells;  
      
      for (var i=0; i<this.layers.length; i++) 
      {
        var layer = this.layers[i];
        layer.setUserBounds(0, 0, layerWidth, layerHeight);
        layer.fullUpdate(
          visibleCells, this.lastVisibleCells,
          rowSizes, columnSizes
        );
      }
      
      this.__checkPaneResize();
    },
    
    
    updateScrollPosition : function() 
    {
      if (this.layers.length == 0) {
        return;
      }
      
      var bounds = this.getBounds();
      if (!bounds) {
        return; // the pane has not yet been rendered -> wait for the appear event
      }                      
      
      var rowCellData = this.rowConfig.getItemAtPosition(this.__scrollTop);
      var columnCellData = this.columnConfig.getItemAtPosition(this.__scrollLeft);
           
      var layerHeight = bounds.height; 
      if (rowCellData.offset) {
        layerHeight += this.rowConfig.getItemSize(rowCellData.index);
      }
      var layerWidth = bounds.width;
      if (columnCellData.offset) {
        layerWidth += this.columnConfig.getItemSize(columnCellData.index);
      }

      this.__layerContainer.setUserBounds(
        -columnCellData.offset, -rowCellData.offset,
        layerWidth, layerHeight
      );
      for (var i=0; i<this.layers.length; i++) {
        this.layers[i].setUserBounds(0, 0, layerWidth, layerHeight);
      }           
      
      var visibleCells = {
        firstRow: rowCellData.index,
        firstColumn: columnCellData.index
      }
      
      var rowSizes = this.rowConfig.getItemSizes(visibleCells.firstRow, bounds.height + rowCellData.offset);
      var columnSizes = this.columnConfig.getItemSizes(visibleCells.firstColumn, bounds.width + columnCellData.offset);

      visibleCells.lastRow = visibleCells.firstRow + rowSizes.length - 1;
      visibleCells.lastColumn = visibleCells.firstColumn + columnSizes.length - 1;
      
      if (
        this.visibleCells.firstRow == visibleCells.firstRow &&
        this.visibleCells.firstColumn == visibleCells.firstColumn &&
        this.visibleCells.lastRow == visibleCells.lastRow &&
        this.visibleCells.lastColumn == visibleCells.lastColumn
      ) {
        return;
      }
           
      this.lastVisibleCells = this.visibleCells;
      this.visibleCells = visibleCells;
      
      // TODO: debugging code
      //qx.ui.core.queue.Manager.flush();      
      
      for (var i=0; i<this.layers.length; i++) 
      {
        // var start = new Date();
        
        var layer = this.layers[i];
        layer.setUserBounds(0, 0, layerWidth, layerHeight);
        layer.updateScrollPosition(
          visibleCells, this.lastVisibleCells, 
          rowSizes, columnSizes
        );

        // TODO: debugging code    
        // this.debug("layer update ("+layer.classname+"): " + (new Date() - start) + "ms");
        // var start = new Date();
        // qx.ui.core.queue.Manager.flush();
        // this.debug("layer flush ("+layer.classname+"): " + (new Date() - start) + "ms");
      }      
    }
  }
});
