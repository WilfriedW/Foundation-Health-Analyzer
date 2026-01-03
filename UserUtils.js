/**
 * Script Include: UserUtils
 * Description: Utility class for user-related operations
 * API Name: UserUtils
 * Client Callable: false
 * Accessible from: All application scopes
 */
var UserUtils = Class.create();
UserUtils.prototype = {
  initialize: function () {},

  /**
   * Get the manager of a user
   * @param {string} userId - The sys_id of the user
   * @returns {GlideRecord|null} - The manager's GlideRecord or null if not found
   */
  getManager: function (userId) {
    if (!userId) {
      return null;
    }

    var userGR = new GlideRecord("sys_user");
    if (userGR.get(userId)) {
      var managerSysId = userGR.getValue("manager");

      if (managerSysId) {
        var managerGR = new GlideRecord("sys_user");
        if (managerGR.get(managerSysId)) {
          return managerGR;
        }
      }
    }

    return null;
  },

  type: "UserUtils",
};
