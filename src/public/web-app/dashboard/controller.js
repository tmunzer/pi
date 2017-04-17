angular.module('Dashboard').controller('DashboardCtrl',
    function ($scope, $mdDialog, LoanService, HardwareService, CompanyService, ErrorService) {
        const colors = ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'];
        const status = { out: 0, lost: 0, available: 0, total: 0 };
        const type = { ap: 0, sr: 0, br: 0, pa: 0, other: 0 };
        $scope.hardwareStatus = {
            type: "PieChart",
            options: {
                pieHole: 0.4,
                colors: colors
            }
        };
        $scope.hardwareType = {
            type: "PieChart",
            options: {
                pieHole: 0.4,
                colors: colors
            }
        };
        $scope.hardwareModel = {
            type: "ColumnChart",
            options: {
                pieHole: 0.4,
                colors: colors,
                isStacked: true
            }
        };
        const hardwareModelRows = []

        function hwStatus(hardware) {
            const available = hardware.count.total - hardware.count.out - hardware.count.lost;
            status.out += hardware.count.out;
            status.lost += hardware.count.lost;
            status.total += hardware.count.total;
            status.available += available;
            hardwareModelRows.push({ c: [{ v: hardware.model }, { v: available }, { v: hardware.count.out }, { v: hardware.count.lost }] });
        }
        function hwType(hardware) {
            switch (hardware.type) {
                case 'Access Point':
                    type.ap += hardware.count.total;
                    break;
                case 'Switch':
                    type.sr += hardware.count.total;
                    break;
                case 'Branch Router':
                    type.br += hardware.count.total;
                    break;
                case 'Physical Appliance':
                    type.pa += hardware.count.total;
                    break;
                case 'Other':
                    type.other += hardware.count.total;
                    break;
            }
        }


        HardwareService.getList().then(function (promise) {
            if (promise && promise.error) ErrorService.display(promise.error);
            else if (promise) {

                promise.forEach(function (hardware) {
                    hwStatus(hardware);
                    hwType(hardware);
                })

                $scope.hardwareStatus.data = {
                    "cols": [
                        { id: "t", label: "Status", type: "string" },
                        { id: "s", label: "# of Devices", type: "number" }
                    ], "rows": [
                        { c: [{ v: "Loaned" }, { v: status.out }] },
                        { c: [{ v: "Lost" }, { v: status.lost }] },
                        { c: [{ v: "Available" }, { v: status.available }] },
                    ]
                };
                $scope.hardwareType.data = {
                    "cols": [
                        { id: "t", label: "Hardware", type: "string" },
                        { id: "s", label: "# of Devices", type: "number" }
                    ], "rows": [
                        { c: [{ v: "Access Point" }, { v: type.ap }] },
                        { c: [{ v: "Switch" }, { v: type.sr }] },
                        { c: [{ v: "Branch Router" }, { v: type.br }] },
                        { c: [{ v: "Physical Appliance" }, { v: type.par }] },
                        { c: [{ v: "Other" }, { v: type.other }] },
                    ]
                };
                $scope.hardwareModel.data = {
                    "cols": [
                        { id: "t", label: "Model", type: "string" },
                        { id: "s", label: "Available", type: "number" },
                        { id: "s", label: "Out", type: "number" },
                        { id: "s", label: "Lost", type: "number" }
                    ], "rows": hardwareModelRows
                }
            }
        })



    }
)