/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     Simon Bull

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Simon Bull (sbull)

************************************************************************ */

/**
 * This singleton manages pooled Object instances.
 *
 * It exists mainly to minimise the amount of browser memory usage by reusing
 * window instances after they have been closed.  However, it could equally be
 * used to pool instances of any type of Object (expect singletons).
 *
 * It is the client's responsibility to ensure that pooled objects are not
 * referenced or used from anywhere else in the application.
 */
qx.Class.define("qx.util.ObjectPool",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._pool = {};
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjectDeep("_pool", 1);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Number of objects of each class, which are pooled.
     *
     * A size of "null" represents an unlimited pool.
     */
    poolSize :
    {
      check : "Number",
      init : null,
      nullable : true
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
      IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * Get the number of instance of type vClassname that are currently
     * pooled.
     *
     * @param vClassname {String} The name of the Object type to count.
     *
     * @return {Integer} The number of instance of type vClassname that are currently
     *         pooled.
     */
    countObjectsOfType : function(vClassname)
    {
      // this.debug("countObjectsOfType() vClassname=" + vClassname );
      // this.debug("countObjectsOfType() this._pool["+vClassname+"]=" + this._pool[vClassname]);
      var count = 0;

      if (this._pool[vClassname]) {
        count = this._pool[vClassname].length;
      }

      return count;
    },

    /**
     * This method finds and returns an instance of a requested type in the pool,
     * if there is one.  Note that the pool determines which instance (if any) to
     * return to the client.  The client cannot get a specific instance from the
     * pool.
     *
     * @param vClassname {String} The name of the Object type to return.
     *
     * @return {Object} An instance of the requested type, or null if no such instance
     *         exists in the pool.
     */
    getObjectOfType : function(vClassname)
    {
      var obj = null;

      if (this._pool[vClassname])
      {
        obj = this._pool[vClassname].pop();

        if (obj == undefined) {
          obj = null;
        }
      }

      return obj;
    },

    /**
     * This method places an Object in a pool of Objects of its type.  Note that
     * once an instance has been pooled, there is no means to get that exact
     * instance back.  The instance may be discarded for garbage collection if
     * the pool of its type is already full.
     *
     * It is assumed that no other references exist to this Object, and that it will
     * not be used at all while it is pooled.
     *
     * @param vObject {Object} An Object instance to pool.
     */
    poolObject : function(vObject)
    {
      // Do some checks to make sure the caller has met their obligations.
      if (vObject == null)
      {
        this.warn("poolObject() Cannot pool " + vObject);
        return;
      }

      var classname = vObject.classname;

      this._ensurePoolOfType(classname);

      // Check to see whether this instance is already in the pool
      //
      // Note that iterating over this._pool[classname].length only works because
      // there are never any empty Array elements in the pool.
      var pooled = false;

      for (i=0, l=this._pool[classname].length; i<l; i++)
      {
        if (this._pool[classname][i] == vObject)
        {
          //this.warn("poolObject() Cannot pool " + vObject + " because it is already in the pool.");
          pooled = true;
          break;
        }
      }

      // Check to see whether the pool for this type is already full
      var full = this._isPoolFull(classname);

      if (full) {
        //this.warn("poolObject() Cannot pool " + vObject + " because the pool is already full.");
      }

      // Pool instance if possible
      if (!pooled && !full) {
        this._pool[classname].push(vObject);
      } else {
        //this.warn("poolObject() Cannot pool " + vObject + "; lost an instance of type " + classname);
      }
    },




    /*
    ---------------------------------------------------------------------------
      IMPL HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * This method checks whether the pool for a given class of Objects is
     * already full.  As a side-effect of calling this method a pool will
     * be created if it does not already exist.
     *
     * @param vClassname {String} The name of a type of Object.
     *
     * @return {Boolean} True if the pool is already full, otherwise false.  Note
     *         that is no upper limit is defined for the type, this method will
     *         always return false.
     */
    _isPoolFull : function(vClassname)
    {
      this._ensurePoolOfType(vClassname);

      var isPoolFull = false;

      if (this.getPoolSize() != null) {
        isPoolFull = this._pool[vClassname].length >= this.getPoolSize();
      }

      return isPoolFull;
    },

    /**
     * This method ensures that there is a pool for Objects of a given type.  If a
     * pool doesn't already exist, this method will create it.
     *
     * @param vClassname {String} The name of a type of Object.
     */
    _ensurePoolOfType : function(vClassname)
    {
      if (!this._pool[vClassname]) {
        this._pool[vClassname] = [];
      }
    }
  }
});
