/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(form)
#require(qx.manager.selection.RadioManager)

************************************************************************ */

qx.ui.form.RadioButton = function(vText, vValue, vName, vChecked) {
  qx.ui.form.CheckBox.call(this, vText, vValue, vName, vChecked);
};

qx.ui.form.RadioButton.extend(qx.ui.form.CheckBox, "qx.ui.form.RadioButton");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The assigned qx.manager.selection.RadioManager which handles the switching between registered buttons
*/
qx.ui.form.RadioButton.addProperty({ name : "manager", type : QxConst.TYPEOF_OBJECT, instance : "qx.manager.selection.RadioManager", allowNull : true });





/*
---------------------------------------------------------------------------
  ICON HANDLING
---------------------------------------------------------------------------
*/

proto.INPUT_TYPE = "radio";




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setChecked(propValue);
  };

  var vManager = this.getManager();
  if (vManager) {
    vManager.handleItemChecked(this, propValue);
  };

  return true;
};

proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue) {
    propValue.add(this);
  };

  return true;
};

proto._modifyName = function(propValue, propOldValue, propData)
{
  if (this._iconObject) {
    this._iconObject.setName(propValue);
  };

  if (this.getManager()) {
    this.getManager().setName(propValue);
  };

  return true;
};

proto._modifyValue = function(propValue, propOldValue, propData)
{
  if (this.isCreated() && this._iconObject) {
    this._iconObject.setValue(propValue);
  };

  return true;
};






/*
---------------------------------------------------------------------------
  EVENT-HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.types.KeyEvent.keys.enter:
      if (!e.getAltKey()) {
        this.setChecked(true);
      };

      break;

    case qx.event.types.KeyEvent.keys.left:
    case qx.event.types.KeyEvent.keys.up:
      qx.event.handler.FocusHandler.mouseFocus = false;
      // we want to have a focus border when using arrows to select
      qx.event.handler.FocusHandler.mouseFocus = false;

      return this.getManager() ? this.getManager().selectPrevious(this) : true;

    case qx.event.types.KeyEvent.keys.right:
    case qx.event.types.KeyEvent.keys.down:
      // we want to have a focus border when using arrows to select
      qx.event.handler.FocusHandler.mouseFocus = false;

      return this.getManager() ? this.getManager().selectNext(this) : true;
  };
};

proto._onclick = function(e) {
  this.setChecked(true);
};

proto._onkeyup = function(e)
{
  if(e.getKeyCode() == qx.event.types.KeyEvent.keys.space) {
    this.setChecked(true);
  };
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  return qx.ui.form.CheckBox.prototype.dispose.call(this);
};
