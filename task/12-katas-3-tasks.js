'use strict';

/**
 * Returns true if word occurrs in the specified word snaking puzzle.
 * Each words can be constructed using "snake" path inside a grid with top, left, right and bottom directions.
 * Each char can be used only once ("snake" should not cross itself).
 *
 * @param {array} puzzle
 * @param {array} searchStr
 * @return {bool}
 *
 * @example
 *   var puzzle = [ 
 *      'ANGULAR',
 *      'REDNCAE',
 *      'RFIDTCL',
 *      'AGNEGSA',
 *      'YTIRTSP',
 *   ]; 
 *   'ANGULAR'   => true   (first row)
 *   'REACT'     => true   (starting from the top-right R adn follow the ↓ ← ← ↓ )
 *   'UNDEFINED' => true
 *   'RED'       => true
 *   'STRING'    => true
 *   'CLASS'     => true
 *   'ARRAY'     => true   (first column)
 *   'FUNCTION'  => false
 *   'NULL'      => false 
 */
function findStringInSnakingPuzzle(puzzle, searchStr) {
    const board = puzzle.map(x => Array.from(x));
    let found = false;

    const checkOrder = (row, col, word, tempWord, visited) => {
        if (row < 0 || row >= board.length || col < 0 
            || col >= board[row].length || 
            board[row][col] !== word[tempWord.length]) {
            return;
        }
        
        if (visited[row][col] === 1) {
            return;
        }

        tempWord += board[row][col];
        visited[row][col] = 1;

        if (tempWord === word) {
            found = true;
            return;
        }

        checkOrder(row, col + 1, word, tempWord, visited);
        checkOrder(row, col - 1, word, tempWord, visited);
        checkOrder(row + 1, col, word, tempWord, visited);
        checkOrder(row - 1, col, word, tempWord, visited);
    }

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == searchStr[0]) {
                const visited = new Array(board.length).fill(0).map(() => new Array(board[0].length).fill(0));
                checkOrder(i, j, searchStr, "", visited);
            }
        }
    }

    return found;
}

/**
 * Returns all permutations of the specified string.
 * Assume all chars in the specified string are different.
 * The order of permutations does not matter.
 * 
 * @param {string} chars
 * @return {Iterable.<string>} all posible strings constructed with the chars from the specfied string
 *
 * @example
 *    'ab'  => 'ab','ba'
 *    'abc' => 'abc','acb','bac','bca','cab','cba'
 */
function* getPermutations(chars) {
    function swap(a, i, j) { 
        const charArray = a.split(""); 
        const temp = charArray[i]; 
        charArray[i] = charArray[j]; 
        charArray[j] = temp; 
        return charArray.join(""); 
    }

    function* permute(str, left, right) { 
        if (left == right) {
            yield str; 
        } else { 
            for (let i = left; i <= right; i++) { 
                str = swap(str, left, i); 
                yield* permute(str, left + 1, right); 
                str = swap(str, left, i); 
            } 
        } 
    } 

    yield* permute(chars, 0, chars.length - 1); 
}


/**
 * Returns the most profit from stock quotes.
 * Stock quotes are stores in an array in order of date.
 * The stock profit is the difference in prices in buying and selling stock.
 * Each day, you can either buy one unit of stock, sell any number of stock units you have already bought, or do nothing. 
 * Therefore, the most profit is the maximum difference of all pairs in a sequence of stock prices.
 * 
 * @param {array} quotes
 * @return {number} max profit
 *
 * @example
 *    [ 1, 2, 3, 4, 5, 6]   => 15  (buy at 1,2,3,4,5 and then sell all at 6)
 *    [ 6, 5, 4, 3, 2, 1]   => 0   (nothing to buy)
 *    [ 1, 6, 5, 10, 8, 7 ] => 18  (buy at 1,6,5 and sell all at 10)
 */
function getMostProfitFromStockQuotes(quotes) {
    const buyingDays = new Array(quotes.length).fill(1);
    let profit = 0, m = 0;
    quotes.slice().reverse().forEach((el, idx, arr) => {
        if (m < el) {
            buyingDays[idx] = 0;
            m = el;
        }
        profit += m - el;
    });
    return profit;
}


/**
 * Class representing the url shorting helper.
 * Feel free to implement any algorithm, but do not store link in the key\value stores.
 * The short link can be at least 1.5 times shorter than the original url.
 * 
 * @class
 *
 * @example
 *    
 *     var urlShortener = new UrlShortener();
 *     var shortLink = urlShortener.encode('https://en.wikipedia.org/wiki/URL_shortening');
 *     var original  = urlShortener.decode(shortLink); // => 'https://en.wikipedia.org/wiki/URL_shortening'
 * 
 */
function UrlShortener() {
    this.urlAllowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789-_.~!*'();:@&=+$,/?#[]";
}

UrlShortener.prototype = {

    encode: function (url) {
        const chars = url.split("").map(c => c.charCodeAt(0));
    },

    decode: function (code) {
        throw new Error('Not implemented');
    }
}


module.exports = {
    findStringInSnakingPuzzle: findStringInSnakingPuzzle,
    getPermutations: getPermutations,
    getMostProfitFromStockQuotes: getMostProfitFromStockQuotes,
    UrlShortener: UrlShortener
};
