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

#package(viewcommon)

************************************************************************ */

function QxCommonViewPage(vButton)
{
  qx.ui.layout.CanvasLayout.call(this);

  if (qx.util.validator.isValid(vButton)) {
    this.setButton(vButton);
  };
};

QxCommonViewPage.extend(qx.ui.layout.CanvasLayout, "QxCommonViewPage");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The attached QxTab to this page.
*/
QxCommonViewPage.addProperty({ name : "button", type : QxConst.TYPEOF_OBJECT });

/*!
  Make element displayed (if switched to true the widget will be created, if needed, too).
  Instead of qx.ui.core.Widget, the default is false here.
*/
QxCommonViewPage.changeProperty({ name : "display", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });




/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyButton = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.setPage(null);
  };

  if (propValue) {
    propValue.setPage(this);
  };

  return true;
};
