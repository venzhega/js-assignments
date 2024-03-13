'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    let sides = ['N', 'E', 'S', 'W'];  // use array of cardinal directions only!
    const windCount = 32;
    const circumference = 360;
    const sideDegrees = 90;
    const angle = circumference / windCount;
    const points = [];
    let azimuth = 0;
    let side = 0;
    let sideSector = 0;

    while (azimuth < circumference) {
        const currentSide = sides[side];
        const nextSide = side + 1 < sides.length ? sides[side + 1] : sides[0];

        let abbreviation = "";
        switch (sideSector) {
            case 0:
                abbreviation = currentSide;
                break;
            case 1:
                abbreviation = currentSide + "b" + nextSide;
                break;
            case 2:
                if (side % 2) {
                    abbreviation = currentSide + nextSide + currentSide;
                } else {
                    abbreviation = currentSide + currentSide + nextSide;
                }
                break;
            case 3:
                if (side % 2) {
                    abbreviation = nextSide + currentSide + "b" + currentSide;
                } else {
                    abbreviation = currentSide + nextSide + "b" + currentSide;
                }
                break;
            case 4:
                if (side % 2) {
                    abbreviation = nextSide + currentSide;
                } else {
                    abbreviation = currentSide + nextSide;
                }
                break;
            case 5:
                if (side % 2) {
                    abbreviation = nextSide + currentSide + "b" + nextSide;
                } else {
                    abbreviation = currentSide + nextSide + "b" + nextSide;
                }
                break;
            case 6:
                if (side % 2) {
                    abbreviation = nextSide + nextSide + currentSide;
                } else {
                    abbreviation = nextSide + currentSide + nextSide;
                }
                break;
            case 7:
                abbreviation = nextSide + "b" + currentSide;
                break;
        }

        points.push({ abbreviation: abbreviation, azimuth: azimuth });

        azimuth += angle;
        side += azimuth % sideDegrees == 0 ? 1 : 0;
        if (++sideSector == 8) {
            sideSector = 0;
        }
    }
    return points;
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function expandBraces(str) {
    function bracePair(tkns, iPosn, iNest, lstCommas) {
        if (iPosn >= tkns.length || iPosn < 0)
            return null;

        var t = tkns[iPosn],
            n = (t === '{') ? (
                iNest + 1
            ) : (t === '}' ? (
                iNest - 1
            ) : iNest),
            lst = (t === ',' && iNest === 1) ? (
                lstCommas.concat(iPosn)
            ) : lstCommas;

        return n ? bracePair(tkns, iPosn + 1, n, lst) : {
            close: iPosn,
            commas: lst
        };
    }

    // Parse of a SYNTAGM subtree
    function andTree(dctSofar, tkns) {
        if (!tkns.length) return [dctSofar, []];

        var dctParse = dctSofar ? dctSofar : {
            fn: and,
            args: []
        },
            head = tkns[0],
            tail = head ? tkns.slice(1) : [],
            dctBrace = head === '{' ? bracePair(tkns, 0, 0, []) : null,
            lstOR = dctBrace && dctBrace.close && dctBrace.commas.length ? (splitAt(dctBrace.close + 1, tkns)) : null;

        return andTree({
            fn: and,
            args: dctParse.args.concat(
                lstOR ? (
                    orTree(dctParse, lstOR[0], dctBrace.commas)
                ) : head
            )
        }, lstOR ? (
            lstOR[1]
        ) : tail);
    }

    // Parse of a PARADIGM subtree
    function orTree(dctSofar, tkns, lstCommas) {
        if (!tkns.length) return [dctSofar, []];
        var iLast = lstCommas.length;

        return {
            fn: or,
            args: splitsAt(
                lstCommas, tkns
            ).map(function (x, i) {
                var ts = x.slice(
                    1, i === iLast ? (
                        -1
                    ) : void 0
                );

                return ts.length ? ts : [''];
            }).map(function (ts) {
                return ts.length > 1 ? (
                    andTree(null, ts)[0]
                ) : ts[0];
            })
        };
    }

    // List of unescaped braces and commas, and remaining strings
    function tokens(str) {
        // Filter function excludes empty splitting artefacts
        var toS = function (x) {
            return x.toString();
        };

        return str.split(/(\\\\)/).filter(toS).reduce(function (a, s) {
            return a.concat(s.charAt(0) === '\\' ? s : s.split(
                /(\\*[{,}])/
            ).filter(toS));
        }, []);
    }

    // PARSE TREE OPERATOR (1 of 2)
    // Each possible head * each possible tail
    function and(args) {
        var lng = args.length,
            head = lng ? args[0] : null,
            lstHead = "string" === typeof head ? (
                [head]
            ) : head;

        return lng ? (
            1 < lng ? lstHead.reduce(function (a, h) {
                return a.concat(
                    and(args.slice(1)).map(function (t) {
                        return h + t;
                    })
                );
            }, []) : lstHead
        ) : [];
    }

    // PARSE TREE OPERATOR (2 of 2)
    // Each option flattened
    function or(args) {
        return args.reduce(function (a, b) {
            return a.concat(b);
        }, []);
    }

    // One list split into two (first sublist length n)
    function splitAt(n, lst) {
        return n < lst.length + 1 ? [
            lst.slice(0, n), lst.slice(n)
        ] : [lst, []];
    }

    // One list split into several (sublist lengths [n])
    function splitsAt(lstN, lst) {
        return lstN.reduceRight(function (a, x) {
            return splitAt(x, a[0]).concat(a.slice(1));
        }, [lst]);
    }

    // Value of the parse tree
    function evaluated(e) {
        return typeof e === 'string' ? e :
            e.fn(e.args.map(evaluated));
    }

    // JSON prettyprint (for parse tree, token list etc)
    function pp(e) {
        return JSON.stringify(e, function (k, v) {
            return typeof v === 'function' ? (
                '[function ' + v.name + ']'
            ) : v;
        }, 2)
    }


    // ----------------------- MAIN ------------------------

    // s -> [s]
    function expansions(s) {
        // BRACE EXPRESSION PARSED
        var dctParse = andTree(null, tokens(s))[0];

        // ABSTRACT SYNTAX TREE LOGGED
        // console.log(pp(dctParse));

        // AST EVALUATED TO LIST OF STRINGS
        return evaluated(dctParse);
    }

    return expansions(str);

}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    const matrix = Array.from({ length: n }, (v, i) => []);

    let i = 1, j = 1;
    for (let e = 0; e < n * n; e++) {
        matrix[i - 1][j - 1] = e;
        if ((i + j) % 2 == 0) {
            if (j < n) {
                j++;
            } else {
                i += 2;
            }
            if (i > 1) {
                i--;
            }
        } else {
            if (i < n) {
                i++;
            } else {
                j += 2;
            }
            if (j > 1) {
                j--;
            }
        }
    }
    return matrix;
}


/**
 * Returns true if specified subset of dominoes can be placed in a row accroding to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    debugger;
    const graph = new Map();

    for (const [x, y] of dominoes) {
        if (!graph.has(x)) {
            graph.set(x, []);
        }

        if (!graph.has(y)) {
            graph.set(y, []);
        }

        graph.get(x).push(y);
        graph.get(y).push(x);
    }

    function dfs(node) {
        visited.add(node);
        for (const neighbor of graph.get(node)) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        }
    }

    const visited = new Set();
    let oddDegreeCount = 0;

    for (const node of graph.keys()) {
        if (graph.get(node).length % 2 !== 0) {
            oddDegreeCount++;
        }
    }

    if (oddDegreeCount === 0 || oddDegreeCount === 2) {
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                dfs(node);
                break;
            }
        }
        return visited.size === graph.size;
    }
    return false;
}


/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    const ranges = [];
    const sorted = [...nums].sort((x, y) => Math.sign(x - y));
    const sequenceBreak = (x, y) => y - x > 1;

    let i = 0;
    while (i < sorted.length) {
        let j = i;
        while (j < sorted.length - 1 && !sequenceBreak(sorted[j], sorted[j + 1])) {
            ++j;
        }

        const from = sorted[i];
        const thru = sorted[j];
        const rangeLen = 1 + j - i;

        if (from === thru) {
            ranges.push([from]);
        } else {
            if (rangeLen > 2) {
                ranges.push([from, thru]);
            } else {
                ranges.push([from], [thru]);
            }
        }
        i = j + 1;
    }
    return ranges.map(r => r.join('-')).join(',');
}

module.exports = {
    createCompassPoints: createCompassPoints,
    expandBraces: expandBraces,
    getZigZagMatrix: getZigZagMatrix,
    canDominoesMakeRow: canDominoesMakeRow,
    extractRanges: extractRanges
};
