var budgetController = (function () {

    //tao bien de chua cac gia tri cua income va expense, bang cach tao cac constructors
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value; 
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    // day la mot cau truc du lieu nham giu tat ca cac bien lung tung vao cung 1 cho 
    var data ={
        allItems: {
            //dung de giu cac bien tham so dau vao
            inc: [],
            exp: [],
        },

        totals: {

            inc: 0,
            ixp:0,
        },

        budget: 0,
    };

    return {
        addItem: function (type, description, value) {
            var newItem, id;
            //them id vao de xac dinh vi tri cua phan tu trong mang
            if (data.allItems[type].length > 0)
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else if (data.allItems[type].length == 0)
                id = 0;

            //tao ra mot bien moi de chua moi item moi khi add vao

            if (type == 'inc') {
                newItem = new Income(id, description, value);
            } else if (type == 'exp') {
                newItem = new Expenses(id, description, value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        //day la ham de xoa item trong budget 
        deleteItem: function (type, id) {
            //tao mot mang chua tat ca cac ID cua cac phan tu 
            var IDs = data.allItems[type].map(function(current) {
                return current.id;
            })
            //method map se tao ra mot mang moi chua tat ca cac phan tu ma ta tim

            //sau do la tim vi tri (index) cua id do ben trong mang de delete
            var index = IDs.indexOf(id);

            //neu index nay co ton tai, tuc la chi toi dung phan tu, thi delete
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // tinh toan total cua inc va exp 
            calculateTotal('inc');
            calculateTotal('exp');
            //tinh toan budget = inc - exp
            data.budget = data.totals['inc'] - data.totals['exp'];
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals['inc'],
                totalExp: data.totals['exp'],
            }
        },

        test: function () {
            console.log(data);
        }
        
    }
})(); 

//-----------------------------------------------------------------------------------------------------------------------//

var UIController = (function () {

    var DOMString = {
        inputType: '#choose',
        inputDescription: '#description',
        inputValue: '#value',
        incomeContainer: '#incomeList',
        expenseContainer: '#expenseList',
        container: '#displayFlex',
    };

    //ham dung de format so ve dang + 2,000.00
    var formatNumber = function(num, type) {
        //viec can lam:
        //1. bo dau - di bang abs 
        num = Math.abs(num);
        //2. bien no thanh float de co .00 dang sau, luc nay no se tro thanh MOT STRING
        num = num.toFixed(2);
        //3. tach chuoi ra lam phan nguyen va thap phan de them dau ,
        var numSplit = num.split('.');
        var int = numSplit[0];
        var dec = numSplit[1];
        //4. them dau - hoac + va tra ve
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        };

        return (type == 'inc' ? '+' : '-') + ' ' + int + "." + dec; 
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i<list.length; i++)
            callback(list[i], i);
    };

    return {
        //day la ham lay gia tri user nhap vao, de dung trong module controller
        //tra ve gia tri dau vao
        getInput: function () { 
            return {
                type: document.getElementById('choose').value,
                description: document.getElementById('description').value,
                value: parseFloat(document.getElementById('value').value),
            }
        },

        getDOMString: function () {
            return DOMString;
        },

        //day la ham hien thi cac item ra UI 
        addListItem: function (object, type) {
            var html, newHtml, element;

            //tao cac placeholder chua cac phan tu chua cac gia tri moi cua input
            if (type == 'inc') {
                element = DOMString.incomeContainer;
                html ='<div class="incomeItem" id="inc-%id%"><div class="item__description">%description%</div><div class="right_clearfix"><div class="item__value">%value% </div><div class="item__delete"><button class="item__delete--btn"> Delete </button></div></div></div>';
            } if (type == 'exp') {
                element = DOMString.expenseContainer;
                html = '<div class="expenseItem" id="exp-%id%"><div class="item__description">%description%</div><div class="right_clearfix"><div class="item__value">%value% </div><div class="item__delete"><button class="item__delete--btn"> Delete </button></div></div></div>';
            }

            //thay cac gia tri cua placeholder bang gia tri cua input
            newHtml = html.replace("%id%", object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', formatNumber(object.value, type));
            console.log(object.id);

            //them cac itemmoi nay vao DOM de hien thi ra UI
            if (type == 'inc')
            document.getElementById('incomeList').insertAdjacentHTML('beforeend',newHtml);
            if (type == 'exp')
            document.getElementById('expenseList').insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        displayBudget: function (object) { 
            document.getElementById('total_money').textContent = formatNumber(object.budget, object.budget > 0 ? 'inc' : 'exp');
            document.getElementById('total_income').textContent = 'INCOME: ' + object.totalInc;
            document.getElementById('total_expense').textContent = 'EXPENSE: ' +object.totalExp;
        },

        clearField: function () {
            var field, fieldArr;
            field = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);
            //vi field nay co dang la list, khong phai array, nen khong the dung thuat toan loop. phair convert sang array truoc
            fieldArr = Array.prototype.slice.call(field);
            //loop qua tung item de xoa 
            fieldArr.forEach(function (current, index, array) {
                current.value = '';
            });
            //focus vao o dau tien cho de nhap
            fieldArr[0].focus();
        },

        displayMonth: function () {
            var now, months, month, year;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'October', 'November', 'December'];
            
            document.getElementById('title').textContent = 'Available budget in ' + months[month] + ' ' + year;
        },

        nodeListForEach: function (list, callback) {
            for (var i = 1; i<=list.length; i++)
                callback(list[i], i);
        },

        changeColor: function () {
            var fields = document.querySelectorAll(DOMString.inputType + ',' + DOMString.inputDescription + ',' + DOMString.inputValue);
            var doit = nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            return doit;
        },

    }
})();

//---------------------------------------------------------------------------------------------------------------------------//

//GLOBAL APP CONTROL
var controller = (function (budgetCtrl, UICtrl) {


    //0. setup event listener, bao gom nut confirm va ca an enter
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMString();
        document.getElementById('confirm').addEventListener('click', ctrlAddItem );
        document.addEventListener('keypress', function (event) {
            //neu day dung la phim enter
            if (event.keyCode == 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.getElementById('choose').addEventListener('change', UICtrl.changeColor);
    };

    var updateBudget = function () {
        //truoc khi tinh toan, can phai chuyen input sang so, vi khi nay no van con dang la 1 chuoi 
        //sau do la tinh toan v update budget len UI 

        //1. tinh toan budget 
        budgetCtrl.calculateBudget();
        //2. tra ve budget 
        var budget = budgetCtrl.getBudget();
        console.log(budget);
        //3. hien thi len UI, function nay duoc viet trong UIctrl 
        UICtrl.displayBudget(budget);
    };


    //day la function ma code se chay khi an confirm hay enter 
    var ctrlAddItem = function () {
        //1. nhan input value 
        // function dung de get data duwoc veit ben trong UIcontroller, va dc goi ra o day de su dung
        var input = UICtrl.getInput();
        console.log(input);
        
        //gia tri chi duoc hien thi neu nhu trong cac o co chua gia tri that su 
        if (input.description !== " " && !isNaN(input.value) && input.value > 0) {
            //2. them item do vao budget ctrl
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            console.log(newItem);
        
            //3. them item do vao UI, sau do xoa het du lieu tren cac field di de user khong the bi bam nham
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearField();
        
            //4. tinh toan tong budget, cai nay lam o1 function rieng 
            updateBudget();
            //5. hien thi budget do len UI, cung lam o function rieng
        };
    };
        
    var ctrlDeleteItem = function (event) {

        //test
        budgetCtrl.test();

        //phai lay ID cua item can delete truoc
        var splitID, type, id;
        var itemID = event.target.parentNode.parentNode.parentNode.id;
        // neu item ID co that, thi tach cai ID do ra lam 2 phan la type va ID, nham xoa no trong budgetCtrl va UI cung 1 luc
        if (itemID) {
            //tach chuoi
            splitID = itemID.split('-');
            //lay type 
            type = splitID[0];
            //lay id 
            id = parseInt(splitID[1]);
        };
        console.log(splitID);

        //delete item tu budgetCtrl
        budgetCtrl.deleteItem(type, id);

        //delete item tu UI
        UICtrl.deleteListItem(itemID);
        //update va cap nhat gia tri cua budget len UI 
        updateBudget();

    };

    return {
        init: function () {
            console.log('No bugs, upto this point');
            setupEventListeners();
            UICtrl.displayMonth();
        },
    }

})(budgetController, UIController);

controller.init();