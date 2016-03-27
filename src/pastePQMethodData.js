//Ken-Q Analysis
//Copyright (C) 2016 Shawn Banasick
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.


// navigation = "single page Nav"  https://github.com/ChrisWojcik/single-page-nav
/*jslint browser: true*/
/*global $, jQuery, _, alert*/

$(document).ready(function () {

    // persist statements in PQMethod paste input section

    (function () {
        var input = document.getElementById('statementsInputBoxPqmethod');
        //retrieve analysisVariable
        input.value = localStorage.getItem("qavStatementsInputBoxPqmethod");

        $('#statementsInputBoxPqmethod').on('input propertychange change', function () {
            localStorage.setItem("qavStatementsInputBoxPqmethod", this.value);
        });
    })();
});


function beginAnalysisPqmethod() {

    var statements = pullStatementsIntoAnalysis("statementsInputBoxPqmethod");
    localStorage.setItem("qavCurrentStatements", JSON.stringify(statements));

    callCentroidFromPQMethod();

    $("#analysisPrep")[0].click();
}

//********************************************************************** flow control
//**** 1.  transform PQMethod pasted data to correlations ***************************
//***********************************************************************************
function callCentroidFromPQMethod() {

    // split into lines
    var statementInput = document.getElementById("sortInputBox").value;
    var arr = statementInput.split(/\r\n|\r|\n/g);
    var array1 = arr.slice(0, arr.length);
    var projectTitleString = array1.shift();
    var sortNumberString = array1.shift();

    // parsing first line of PQMethod file to set qav variables
    var numberSorts = parseInt(projectTitleString.slice(4, 6)); // lipset 9
    localStorage.setItem("qavTotalNumberSorts", numberSorts);

    var originalSortSize = parseInt(projectTitleString.slice(7, 9)); // lipset 33
    var qavProjectName3 = (projectTitleString.slice(10, 70));
    var qavProjectName2 = qavProjectName3.trim();
    var qavProjectName = sanitizeProjectName(qavProjectName2);
    localStorage.setItem("qavProjectName", JSON.stringify(qavProjectName));

    localStorage.setItem("qavTotalStatements", originalSortSize);
    localStorage.setItem("qavOriginalSortSize", originalSortSize);

    // parsing and coercing second line of PQMethod file
    // warning -array temp1 has an extra "0" entry in position 0
    var temp1b = sortNumberString.replace(/\s\s/g, ' ');
    var temp1a = temp1b.split(" ");
    var temp1 = temp1a.map(Number);
    var pyramidShapeNumbers = temp1.slice(3, temp1.length);

    localStorage.setItem("qavPyramidShape", JSON.stringify(pyramidShapeNumbers));

    calculateSortTriangleShape(pyramidShapeNumbers);

    var sortSize = ((originalSortSize * 2) + 10); // lipset 76
    var names = [];
    var sorts = [];

    // break text array into names text array and sorts text array
    _(array1).forEach(function (element) {
        if (element.length) {
            var nameFragment = element.slice(0, 8);
            names.push(nameFragment);
            var sortFragment = element.slice(10, sortSize);
            sorts.push(sortFragment);
        }
    }).value();

    // set respondent names for later
    localStorage.setItem("qavRespondentNames", JSON.stringify(names));

    // format pasted data
    var sortsAsNumbers = convertSortsTextToNumbers(sorts, originalSortSize);

    // get correlations for pasted data
    var correlationTable = calculateCorrelations(sortsAsNumbers, names);

    // display the correlation table for the pasted PQMethod data
    createDisplayTableJQUERY(correlationTable, "correlationTable2");
}

function sanitizeProjectName(qavProjectName2) {
    if (qavProjectName2 === '') {
        return '_';
    }
    return qavProjectName2.replace(/[^a-zA-Z0-9.-]/g, function () {
        return '_'; // + match[0].charCodeAt(0).toString(16) + '_'; 
    });
}

function calculateSortTriangleShape(pyramidShapeNumbers) {

    var sortPossibleValues = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    var qavSortTriangleShape = [];
    for (var i = 0; i < sortPossibleValues.length; i++) {
        for (var j = 0; j < pyramidShapeNumbers[i]; j++) {
            qavSortTriangleShape.push(sortPossibleValues[i]);
        }
    }
    localStorage.setItem("qavSortTriangleShape", JSON.stringify(qavSortTriangleShape));
}