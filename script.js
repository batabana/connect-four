(function() {
    var currPlayer = "player1";
    var currColor = "#06524d";
    var currName = $("input")
        .eq(0)
        .val();
    var rowNum = 6;
    var colNum = 7;
    var winNum = 4;

    // clear input-field
    $("input").on("click", function(e) {
        if (
            $(e.target).val() == "Player 1" ||
            $(e.target).val() == "Player 2"
        ) {
            $(e.target).val("");
        }
    });

    // hide startbox, set players' names, build board
    $(".start-box")
        .find("button")
        .on("click", buildBoard);

    function buildBoard() {
        console.log(rowNum, colNum, winNum);
        // hide startbox + overlay, show play-screen
        $(".start-box").hide();
        $(".overlay").addClass("hide");
        $(".play-screen")
            .removeClass("hide")
            .addClass("show");

        // set players' names
        $(".player")
            .eq(0)
            .find("span")
            .html(
                $("input")
                    .eq(0)
                    .val()
            );
        $(".player")
            .eq(1)
            .find("span")
            .html(
                $("input")
                    .eq(1)
                    .val()
            );

        // set current player to player 1
        currPlayer = "player1";
        $(".player")
            .eq(1)
            .removeClass("current");
        $(".player")
            .eq(0)
            .addClass("current");

        // build board in html
        var html = "";
        for (var c = 0; c < colNum; c++) {
            html += "<div class='column'>";
            for (var r = 0; r < rowNum; r++) {
                html += "<div class='slot'><div class='hole'></div></div>";
            }
            html += "</div>";
        }
        $(".board").html(html);

        if (winNum == 3) {
            $(".hole").addClass("three");
            $(".slot").addClass("three");
        }

        // add events
        $(".board").off("click", ".column", processClick);
        $(".board").on("click", ".column", processClick);
        $(".board").on("mouseenter", ".column", previewNextMove);
        $(".board").on("mouseleave", ".column", deletePreview);
        $(".play-screen").on("click", "#name-button", function() {
            location.reload();
        });
        $(".play-screen").on("click", "#game-button", buildBoard);
        $(".play-screen").on("click", "#three-button", function() {
            rowNum = 3;
            colNum = 3;
            winNum = 3;
            console.log(rowNum, colNum, winNum);
            buildBoard();
        });
    }

    function processClick(e) {
        // find slot at the bottom and color it
        var currCol = $(e.currentTarget);
        var currSlots = currCol.find(".slot");
        currSlots.removeClass(currPlayer + "preview");
        for (var i = 0; i < currSlots.length; i++) {
            if (
                !currSlots.eq(i).hasClass("player1") &&
                !currSlots.eq(i).hasClass("player2")
            ) {
                // start at the bottom: if currSlot is not taken (has neither class player1 or player2) then break the loop and use i to assigne the currPlayer-class to currSlot
                break;
            }
        }
        currSlots.eq(i).addClass(currPlayer);
        // check for victory: columns, rows, diagonals
        if (checkVictory(currSlots)) {
            victoryProcessing();
        } else if (checkVictory($(".slot:nth-child(" + (i + 1) + ")"))) {
            victoryProcessing();
        } else {
            for (var b = 0; b < colNum * rowNum; b++) {
                var currSlot = $(".slot").eq(b);
                // initialize objects for going up and down with current slot
                var slotsDown = currSlot;
                var slotsUp = currSlot;
                var nextDownSlot;
                var nextUpSlot;
                // adding slots to each object in steps of 2/5 (down) and 4/7 (up)
                for (var c = 1; c < winNum; c++) {
                    if (winNum == 4) {
                        nextDownSlot = $(".slot").eq(b + 5 * c);
                        nextUpSlot = $(".slot").eq(b + 7 * c);
                    } else if (winNum == 3) {
                        nextDownSlot = $(".slot").eq(b + 2 * c);
                        nextUpSlot = $(".slot").eq(b + 4 * c);
                    }

                    // check if the next slot is in the neighbouring column
                    if (
                        currSlot.parent().index() + c ==
                        nextDownSlot.parent().index()
                    ) {
                        slotsDown = slotsDown.add(nextDownSlot);
                    }
                    if (
                        currSlot.parent().index() + c ==
                        nextUpSlot.parent().index()
                    ) {
                        slotsUp = slotsUp.add(nextUpSlot);
                    }
                }
                if (checkVictory(slotsDown)) {
                    victoryProcessing();
                    return;
                } else if (checkVictory(slotsUp)) {
                    victoryProcessing();
                    return;
                }
            }
            switchPlayers();
        }
    }

    function checkVictory(slots) {
        var checkStr = "";
        for (var a = 0; a < slots.length; a++) {
            if (slots.eq(a).hasClass(currPlayer)) {
                checkStr += "1";
            } else {
                checkStr += "0";
            }
        }
        var searchStr = "";
        if (winNum == 4) {
            searchStr = "1111";
        } else if (winNum == 3) {
            searchStr = "111";
        }
        if (checkStr.indexOf(searchStr) > -1) {
            for (var i = 0; i < winNum; i++) {
                slots.eq(i + checkStr.indexOf(searchStr)).addClass("win");
            }

            // hacking the blink on winning slots in ^^'
            setTimeout(function() {
                $(".slot.win").css("backgroundColor", "#9abd95");
            }, 50);
            setTimeout(function() {
                $(".slot.win").css("backgroundColor", "#c45852");
            }, 100);
            setTimeout(function() {
                $(".slot.win").css("backgroundColor", "#9abd95");
            }, 150);
            setTimeout(function() {
                $(".slot.win").css("backgroundColor", "#c45852");
            }, 200);

            // fill board with winning color
            function fillBoard(idx) {
                $(".slot")
                    .eq(colNum * rowNum - idx)
                    .find(".hole")
                    .css("backgroundColor", currColor);
                setTimeout(function() {
                    idx && fillBoard(idx - 1);
                }, 50);
            }
            fillBoard(colNum * rowNum);

            // yet another hacky blink on the whole board ¯\_(ツ)_/¯
            if (winNum == 4) {
                setTimeout(function() {
                    $(".hole").css("backgroundColor", "white");
                }, 2200);
                setTimeout(function() {
                    $(".hole").css("backgroundColor", currColor);
                }, 2300);
                setTimeout(function() {
                    $(".hole").css("backgroundColor", "white");
                }, 2400);
                setTimeout(function() {
                    $(".hole").css("backgroundColor", currColor);
                }, 2500);

                // show victory message in overlay
                setTimeout(function() {
                    $(".overlay").removeClass("hide");
                    $(".overlay")
                        .find("span")
                        .html("Congrats " + currName + "!");
                }, 3000);
            } else if (winNum == 3) {
                console.log("three");
                setTimeout(function() {
                    $(".hole").css("backgroundColor", "white");
                }, 500);
                setTimeout(function() {
                    $(".hole").css("backgroundColor", currColor);
                }, 600);
                setTimeout(function() {
                    $(".hole").css("backgroundColor", "white");
                }, 700);
                setTimeout(function() {
                    $(".hole").css("backgroundColor", currColor);
                }, 800);

                // show victory message in overlay
                setTimeout(function() {
                    $(".overlay").removeClass("hide");
                    $(".overlay")
                        .find("span")
                        .html("Congrats " + currName + "!");
                }, 1300);
            }

            return true;
        }
    }

    function switchPlayers() {
        if (currPlayer == "player1") {
            currPlayer = "player2";
            currColor = "#423d5b";
            currName = $("input")
                .eq(1)
                .val();
            $(".player")
                .eq(0)
                .removeClass("current");
            $(".player")
                .eq(1)
                .addClass("current");
        } else {
            currPlayer = "player1";
            currColor = "#06524d";
            currName = $("input")
                .eq(0)
                .val();
            $(".player")
                .eq(1)
                .removeClass("current");
            $(".player")
                .eq(0)
                .addClass("current");
        }
    }

    function victoryProcessing() {
        console.log(currPlayer, " won");
        $(".board").off("click", ".column", processClick);
        $(".board").off("mouseenter", ".column", previewNextMove);
        return;
    }

    function previewNextMove(e) {
        var currCol = $(e.currentTarget);
        var currSlots = currCol.find(".slot");
        for (var i = 0; i < currSlots.length; i++) {
            if (
                !currSlots.eq(i).hasClass("player1") &&
                !currSlots.eq(i).hasClass("player2")
            ) {
                break;
            }
        }
        currSlots.eq(i).addClass(currPlayer + "preview");
    }

    function deletePreview(e) {
        $(e.currentTarget)
            .find(".slot")
            .removeClass(currPlayer + "preview");
    }
})();
