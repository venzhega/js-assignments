'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}

Rectangle.prototype.getArea = function () {
    return this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class ComplexCssSelector {
    constructor() {
        this.selectors = new Map();
        this.nextSelector = null;
        this.moreThenOneValidationError = "Element, id and pseudo-element should not occur more then one time inside the selector";
        this.orderValidationError = "Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element";
    }

    moreThenOneValidator(selector) {
        if (this.selectors.has(selector)) {
            throw new Error(this.moreThenOneValidationError);
        }
    }

    orderValidator(selector) {
        const prevSelector = [...this.selectors.keys()].at(-1);
        if (prevSelector == undefined) {
            return;
        }

        if (selector == "id") {
            if (prevSelector == "element") {
                return;
            }
        }

        if (selector == "class") {
            if (prevSelector == "id" || prevSelector == "element" || prevSelector == "class") {
                return;
            }
        }

        if (selector == "attribute") {
            if (prevSelector == "id" || prevSelector == "element" || prevSelector == "class" || prevSelector == "attribute") {
                return;
            }
        }

        if (selector == "pseudo-class") {
            if (prevSelector == "id" || prevSelector == "element" || prevSelector == "class" || prevSelector == "attribute" || prevSelector == "pseudo-class") {
                return;
            }
        }

        if (selector == "pseudo-element") {
            if (prevSelector == "id" || prevSelector == "element" || prevSelector == "class" || prevSelector == "attribute" || prevSelector == "pseudo-class") {
                return;
            }
        }

        throw new Error(this.orderValidationError);
    }

    id(value) {
        this.moreThenOneValidator("id");
        this.orderValidator("id");

        this.selectors.set("id", value);
        return this;
    }

    class(value) {
        this.orderValidator("class");

        if (this.selectors.has("class")) {
            this.selectors.get("class").push(value);
        } else {
            this.selectors.set("class", [value]);
        }
        return this;
    }

    element(value) {
        this.moreThenOneValidator("element");
        this.orderValidator("element");

        this.selectors.set("element", value);
        return this;
    }

    attr(value) {
        this.orderValidator("attribute");

        if (this.selectors.has("attribute")) {
            this.selectors.get("attribute").push(value);
        } else {
            this.selectors.set("attribute", [value]);
        }
        return this;
    }

    pseudoClass(value) {
        this.orderValidator("pseudo-class");

        if (this.selectors.has("pseudo-class")) {
            this.selectors.get("pseudo-class").push(value);
        } else {
            this.selectors.set("pseudo-class", [value]);
        }
        return this;
    }

    pseudoElement(value) {
        this.moreThenOneValidator("pseudo-element");
        this.orderValidator("pseudo-element");
        
        this.selectors.set("pseudo-element", value);
        return this;
    }

    combine(combinator, selector) {
        this.nextSelector = {
            combinator: combinator,
            selector: selector
        };
        return this;
    }

    stringify() {
        let str = "";
        this.selectors.forEach((val, key) => {
            switch (key) {
                case "element":
                    str += `${val}`
                    break;
                case "id":
                    str += `#${val}`
                    break;
                case "attribute":
                    str += val.reduce((acc, cur, _) => acc + `[${cur}]`, "");
                    break;
                case "class":
                    str += val.reduce((acc, cur, _) => acc + `.${cur}`, "");
                    break;
                case "pseudo-class":
                    str += val.reduce((acc, cur, _) => acc + `:${cur}`, "");
                    break;
                case "pseudo-element":
                    str += `::${val}`
                    break;
            }
        });

        if (this.nextSelector) {
            str += ` ${this.nextSelector.combinator} ${this.nextSelector.selector.stringify()}`;
        }

        return str;
    }
}

const cssSelectorBuilder = {

    element: function(value) {
        return new ComplexCssSelector().element(value);
    },

    id: function(value) {
        return new ComplexCssSelector().id(value);
    },

    class: function(value) {
        return new ComplexCssSelector().class(value);
    },

    attr: function(value) {
        return new ComplexCssSelector().attr(value);
    },

    pseudoClass: function(value) {
        return new ComplexCssSelector().pseudoClass(value);
    },

    pseudoElement: function(value) {
        return new ComplexCssSelector().pseudoElement(value);
    },

    combine: function(selector1, combinator, selector2) {
        return selector1.combine(combinator, selector2);
    },
};


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
