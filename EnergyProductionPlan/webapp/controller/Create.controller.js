sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
    "use strict";
    var that = null;
    var pictureObj = null;
    const initialValues = {
        YEAR: "",
        MONTH: "",
        DAY: "",
        WEEKDAY: "",
        WEEKNUM: "",
        WEEKEND_YN: "",
        HOUR: "",
        MINUTE: "",
        EN_PROD_PLANNED: ""
    };
    return BaseController.extend("ns.EnergyProductionPlan.controller.Create", {
        onInit: function () {

            var oModel = new JSONModel(initialValues);

            this.getView().setModel(oModel, "initial");
            that = this;

        },
        onNavButtonPress: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("worklist", {});
        },
        onSave: function () {

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
                url: "/production-plan-values/Values",
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                processData: false,
                data: JSON.stringify(data)
            };

            $.ajax(settings)
                .done(
                    function (response) {

                        var msg = "Plan successfully created";
                        MessageToast.show(msg);
                        //reset the from model to initial values to empty the fields
                        this.getView().getModel("initial").setData({
                            YEAR: "",
                            MONTH: "",
                            DAY: "",
                            WEEKDAY: "",
                            WEEKNUM: "",
                            WEEKEND_YN: "",
                            HOUR: "",
                            MINUTE: "",
                            EN_PROD_PLANNED: ""
                        });

                        //nativate back to home page
                        this.getOwnerComponent()
                            .getRouter()
                            .navTo("worklist", {});
                    }.bind(this)
                )
                .fail(function () {
                    MessageToast.show("Error: Please Try Again!");
                });
        }
    });
});
