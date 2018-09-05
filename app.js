
// Budget Controller
var budgetController = (function () {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    singleItems: {
      expenses: [],
      incomes: []
    },
    totals: {
      expenses: 0,
      incomes: 0
    },

    budget: 0,

    percentage: -1
  };

   var generateId = function(type) {
     var ID;
     if (data.singleItems[type].length === 0) {
       ID = 0;
     } else if (type === 'expenses') {
       ID = data.singleItems['expenses'][(data.singleItems['expenses'].length) - 1].id + 1;
     } else if (type === 'incomes') {
       ID = data.singleItems['incomes'][(data.singleItems['incomes'].length) - 1].id + 1;
     }
     return ID;
   };

   var calculateTotal = function(type) {
     var sum = 0;

     if (type === 'inc') {
       data.singleItems['incomes'].forEach(function(current) {
         sum += current.value;
       });
       data.totals['incomes'] = sum;
     } else if (type === 'exp') {
       data.singleItems['expenses'].forEach(function(current) {
         sum += current.value;
       });
       data.totals['expenses'] = sum;
     }

   };

  return {
    addItem: function(type, des, val) {
      var newItem, id;

      if (type === 'exp') {
        id = generateId('expenses');
        newItem = new Expense(id, des, val);
        data.singleItems['expenses'].push(newItem);
      } else if (type === 'inc') {
        id = generateId('incomes');
        newItem = new Income(id, des, val);
        data.singleItems['incomes'].push(newItem);
      }
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      if (type === 'income') {
        ids = data.singleItems['incomes'].map(function(cur, index, arr) {
          return cur.id;
        });
      } else if (type === 'expense') {
        ids = data.singleItems['expenses'].map(function(cur, index, arr) {
          return cur.id;
        });
      }

      index = ids.indexOf(id);

      if (index !== -1) {
        if (type === 'income') {
          data.singleItems['incomes'].splice(index, 1);
        } else if (type === 'expense') {
          data.singleItems['expenses'].splice(index, 1);
        }
      }
    },

    calculateBudget: function() {
      // Calculate total incomes
      calculateTotal('inc');
      // Calculate total expenses
      calculateTotal('exp');
      // Calculate the budget: income - expense
      data.budget = data.totals['incomes'] - data.totals['expenses'];
      // Calculate the percentage of income that we spent
      if (data.totals.incomes > 0) {
        data.percentage = Math.round((data.totals.expenses / data.totals.incomes) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.singleItems['expenses'].forEach(function(cur) {
        cur.calcPercentage(data.totals['incomes']);
      });
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.incomes,
        totalExpense: data.totals.expenses,
        percentage: data.percentage
      };
    },

    getPercentages: function() {
      var allPercent = data.singleItems['expenses'].map(function(cur) {
        return cur.getPercentage();
      });
      return allPercent;
    }

  };
})();


// UI Controller
var UIController = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    type === 'exp' ? sign = '-' : sign = '+';
    return sign + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(nodeList, callback) {
    for (var i=0; i < nodeList.length; ++i) {
      callback(nodeList[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addItemToList: function(obj, type) {
      var htmlString, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        htmlString = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    } else if (type === 'exp') {
      element = DOMstrings.expenseContainer;
        htmlString = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    }

      // Replace placeholder text with some actual data
      newHtml = htmlString.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId) {
      var elem = document.getElementById(selectorId);
      elem.parentNode.removeChild(elem);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentArr) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(cur, index) {
        if (percentArr[index] > 0) {
        cur.textContent = percentArr[index] + '%';
      } else {
        cur.textContent = '---';
      }
    });
  },

      displayMonth: function() {
        var now, months, year, month;

        now = new Date();
        year = now.getFullYear();

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'
      , 'September', 'October', 'November', 'December'];
        month = now.getMonth();
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
      },

      changedType: function() {
        var fields = document.querySelectorAll(
          DOMstrings.inputType + ',' +
          DOMstrings.inputDescription + ',' +
          DOMstrings.inputValue
        );

        nodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
      },


    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();


// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {

  var setUpEventListeners = function() {
    var Dom = UICtrl.getDOMstrings();
    document.querySelector(Dom.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function() {
    // 1. Calculate the budget.
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    budgetCtrl.calculatePercentages();

    var percentages = budgetCtrl.getPercentages();

    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    // To-do list
    // 1. Get field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !(isNaN(input.value)) && (input.value > 0)) {
      // 2. Add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add the new item to UI
      UICtrl.addItemToList(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      updatePercentages();
    }

  };

  var ctrlDeleteItem = function(event) {
    var itemId, splitId, type, Id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      // Income-0 or Expense-0
      splitId = itemId.split('-');
      type = splitId[0];
      Id = parseInt(splitId[1]);

      budgetCtrl.deleteItem(type, Id);

      UICtrl.deleteListItem(itemId);

      updateBudget();

      updatePercentages();
    }
  };

  return {
    init: function() {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1
      });
      setUpEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();
