sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, MessageToast) {
    "use strict";

	return BaseController.extend("ns.EnergyProductionPlan.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {

			// Model used to manipulate control states. The chosen values make sure,
			// detail page shows busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "objectView");
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
        },
        
        onDelete : function(ID) {
            var settings = {
                async: true,
                url: "/production-plan-values/Values/" +ID,
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                },
                processData: false
            };


            $.ajax(settings)
                .done(
                    function (response) {

                        var msg = "Plan successfully deleted";
                        MessageToast.show(msg);

                        //nativate back to home page
                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("worklist", {});
                    }.bind(this)
                )
                .fail(function () {
                    MessageToast.show("Error: Please Try Again!");
                });
        },
        onSave : function(ID){
            var data = this.getView()
                .getModel("initial")
                .getData();

            data.YEAR = +data.YEAR;
            data.MONTH = +data.MONTH;
            data.DAY = +data.DAY;
            data.WEEKDAY = +data.WEEKDAY;
            data.WEEKNUM = +data.WEEKNUM;
            data.HOUR = +data.HOUR;
            data.MINUTE = +data.MINUTE;
            data.EN_PROD_PLANNED = +data.EN_PROD_PLANNED;


            var settings = {
                async: true,
                url: "/production-plan-values/Values/" +ID,
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                processData: false,
                data:JSON.stringify(data)
            };


            $.ajax(settings)
                .done(
                    function (response) {

                        var msg = "Plan successfully updated";
                        MessageToast.show(msg);

                        //nativate back to home page
                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("worklist", {});
                    }.bind(this)
                )
                .fail(function () {
                    MessageToast.show("Error: Please Try Again!");
                });
        },

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").objectId;
			this._bindView("/Values" + sObjectId);
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oViewModel = this.getModel("objectView");

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle();

			oView.getBindingContext().requestObject().then((function (oObject) {
				var sObjectId = oObject.ID,
                    sObjectName = oObject.DAY;

				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			}).bind(this));
		}

	});

});