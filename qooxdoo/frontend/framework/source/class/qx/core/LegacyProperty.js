/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * Internal class for handling dynamic properties.
 *
 * WARNING: This is a legacy class to support the old-style dynamic properties
 * in 0.6.x. Its much improved successor is {@link qx.core.Property}.
 *
 * @deprecated This class is supposed to be removed in qooxdoo 0.7
 */
qx.Class.define("qx.core.LegacyProperty",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
      OBJECT PROPERTY EXTENSION
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a so-named fast property to a prototype.
     *
     * @deprecated
     * @type static
     * @param config {Map} Configuration structure
     * @param proto {Object} Prototype where the methods should be attached
     * @return {void}
     */
    addFastProperty : function(config, proto)
    {
      var vName = config.name;
      var vUpName = qx.lang.String.firstUp(vName);

      var vStorageField = "_value" + vUpName;
      var vGetterName = "get" + vUpName;
      var vSetterName = "set" + vUpName;
      var vComputerName = "_compute" + vUpName;

      proto[vStorageField] = typeof config.defaultValue !== "undefined" ? config.defaultValue : null;

      if (config.noCompute)
      {
        proto[vGetterName] = function() {
          return this[vStorageField];
        };
      }
      else
      {
        proto[vGetterName] = function() {
          return this[vStorageField] == null ? this[vStorageField] = this[vComputerName]() : this[vStorageField];
        };
      }

      proto[vGetterName].self = proto.constructor;

      if (config.setOnlyOnce)
      {
        proto[vSetterName] = function(vValue)
        {
          this[vStorageField] = vValue;
          this[vSetterName] = null;

          return vValue;
        };
      }
      else
      {
        proto[vSetterName] = function(vValue) {
          return this[vStorageField] = vValue;
        };
      }

      proto[vSetterName].self = proto.constructor;

      if (!config.noCompute)
      {
        proto[vComputerName] = function() {
          return null;
        };

        proto[vComputerName].self = proto.constructor;
      }
    },


    /**
     * Adds a so-named cached property to a prototype
     *
     * @deprecated
     * @type static
     * @param config {Map} Configuration structure
     * @param proto {Object} Prototype where the methods should be attached
     * @return {void}
     */
    addCachedProperty : function(config, proto)
    {
      var vName = config.name;
      var vUpName = qx.lang.String.firstUp(vName);

      var vStorageField = "_cached" + vUpName;
      var vComputerName = "_compute" + vUpName;
      var vChangeName = "_change" + vUpName;

      if (typeof config.defaultValue !== "undefined") {
        proto[vStorageField] = config.defaultValue;
      }

      proto["get" + vUpName] = function()
      {
        if (this[vStorageField] == null) {
          this[vStorageField] = this[vComputerName]();
        }

        return this[vStorageField];
      };

      proto["_invalidate" + vUpName] = function()
      {
        if (this[vStorageField] != null)
        {
          this[vStorageField] = null;

          if (config.addToQueueRuntime) {
            this.addToQueueRuntime(config.name);
          }
        }
      };

      proto["_recompute" + vUpName] = function()
      {
        var vOld = this[vStorageField];
        var vNew = this[vComputerName]();

        if (vNew != vOld)
        {
          this[vStorageField] = vNew;
          this[vChangeName](vNew, vOld);

          return true;
        }

        return false;
      };

      proto[vChangeName] = function(vNew, vOld) {};

      proto[vComputerName] = function() {
        return null;
      };

      proto["get" + vUpName].self = proto.constructor;
      proto["_invalidate" + vUpName].self = proto.constructor;
      proto["_recompute" + vUpName].self = proto.constructor;
    }
  }
});
