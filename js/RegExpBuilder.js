/**
 * A simple helper class which wraps all regex symbols into methods. Because of method chaining it
 * is possible to generate more robust and better readable regex code
 * 
 * @constructor
 * @public
 * @author Kai Mueller
 * @version 0.1.0
 * @class RegExpBuilder
 */

function RegExpBuilder() {
	"use strict";

	// internal variables
	var _sRegExpPattern = "";
	var _aRegexCharacters = [ "(", ")", "/", ".", "*", "?", "+", "$", "^", "=", "!" ];
	var _validationStack = [];

	// internal constants
	var _OPEN_GROUP = {
		beginMissing : "Before closing a group you must open one",
		endMissing : "Missing end group statement"
	};
	var _OPEN_LOOK_AHEAD = {
		beginMissing : "Before closing a look ahead you must open one",
		endMissing : "Missing open look ahaed group statement"
	};

	function _add(sText) {
		_sRegExpPattern = _sRegExpPattern + sText;
	}

	function _popValidationCheck(sExpectetStackEntry) {
		var entry = _validationStack[_validationStack.length - 1];
		if (entry !== sExpectetStackEntry) {
			throw new Error(sExpectetStackEntry.beginMissing);
		}
		_validationStack.pop();
	}

	function _startlookAhead(bNegate) {
		_validationStack.push(_OPEN_LOOK_AHEAD);
		var sSign = "=";
		if (bNegate) {
			sSign = "!";
		}
		_add("(?" + sSign);
	}

	function _endLookAhead() {
		_popValidationCheck(_OPEN_LOOK_AHEAD);
		_add(")");
	}

	function _escape(sText) {
		var aChars = sText.split("");
		aChars.forEach(function(sChar, iIndex) {
			if (_aRegexCharacters.indexOf(sChar) !== -1) {
				aChars[iIndex] = "\\" + sChar;
			}
		});
		return aChars.join("");
	}

	function _regExpToString(oRegExp) {
		if (!oRegExp || !oRegExp instanceof RegExp) {
			throw new Error("The overgiven parameter is undefined, null, or not a instance of RegExp");
		}
		return oRegExp.toString().substring(1, oRegExp.toString().length - 1);
	}

	return {
		/** @lends RegExpBuilder.prototype */
		// ######### matches #########
		/**
		 * Adds a free text to a pattern. Free means no escaping is done, so it is possible to use
		 * regex symbols here.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @param {string}
		 *            sText text to add
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		matchesFreeText : function(sText) {
			_add(sText);
			return this;
		},

		/**
		 * Adds the whole regex pattern of a RegExp to the current pattern.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @param {RegExp}
		 *            oRegExp the RegExp to add
		 * @return {RegExpBuilder} the current instance for methode chaining
		 * @throws {Error}
		 *             if oRegExp is not a instance of RegExp
		 */
		matchesRegExp : function(oRegExp) {
			_add(_regExpToString());
			return this;
		},

		/**
		 * Adds a matcher for any character except the line break. This is equivalent to the regex
		 * symbol '.'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-dot
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		matchesAny : function() {
			_add(".");
			return this;
		},

		/**
		 * Adds a matcher for a list of possible characters. It is possible to provide a range with
		 * a '-' This is equivalent to the regex function '[]'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-character-set
		 * @param {string}
		 *            sCharacters a list of the characters to match
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		matchesFor : function(sCharacters) {
			_add("[" + sCharacters + "]");
			return this;
		},

		/**
		 * Adds a negative matcher for a list of possible characters. It is possible to provide a
		 * range with a '-' This is equivalent to the regex function '[^]'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-negated-character-set
		 * @param {string}
		 *            sCharacters a list of the characters not to match
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		matchesNotFor : function(sCharacters) {
			_add("[^" + sCharacters + "]");
			return this;
		},

		/**
		 * Adds a matcher for this text. All characters which are used internally by regex will be
		 * escaped
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @param {string}
		 *            sText text to match
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		matchesText : function(sText) {
			_add(_escape(sText));
			return this;
		},

		// ######### How many times #########

		/**
		 * After a matcher this specifies how many times the matcher should match. It is possible to
		 * define a minimum and a maximum or a exact number This is equivalent to the regex function
		 * '{x,x}' or '{x}' where x is a integer
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-quantifier-range
		 * @param {int}
		 *            iMin minumum times to match or without the parameters iMax exact how often
		 * @param {int}
		 *            iMax (optional) maximum times to match
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		matchesTimes : function(iMin, iMax) {
			if (iMax) {
				_add("{" + iMin + "," + iMax + "}");
			} else {
				_add("{" + iMin + "}");
			}
			return this;
		},

		/**
		 * After a matcher this specifies that the matcher should match one or more times. This is
		 * equivalent to the regex function '+'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-plus
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		oneOrMoreTimes : function(sText) {
			_add("+");
			return this;
		},

		/**
		 * After a matcher this specifies that the matcher should match zero or more times. This is
		 * equivalent to the regex function '*'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-asterisk
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		zeroOrMoreTimes : function() {
			_add("*");
			return this;
		},

		/**
		 * After a matcher this specifies that the matcher should match zero or one times. This is
		 * equivalent to the regex function '?'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-questionmark
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		zeroOrOneTimes : function(sText) {
			_add("?");
			return this;
		},

		// ######### Control Signs #########

		/**
		 * Adds a matcher of a word boundary. This is equivalent to the regex function '\\b'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-word-boundary
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		macthesWordBoundary : function() {
			_add("\\b");
			return this;
		},

		/**
		 * Adds a matcher of a non-word boundary. This is equivalent to the regex function '\\B'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-non-word-boundary
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		macthesNotWordBoundary : function() {
			_add("\\B");
			return this;
		},

		/**
		 * Adds a matcher for the beginning of the input. This is equivalent to the regex function
		 * '^'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-caret
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		beginLine : function() {
			_add("^");
			return this;
		},

		/**
		 * Adds a matcher for the end of the input. This is equivalent to the regex function '$'
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-dollar
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		endLine : function() {
			_add("$");
			return this;
		},

		// ######### Groups #########

		/**
		 * Begins a new group. This is equivalent to the regex function '('.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-capturing-parentheses
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		beginGroup : function() {
			_validationStack.push(_OPEN_GROUP);
			_add("(");
			return this;
		},

		/**
		 * Ends a group. A validation is done if a corresponding open group exists. This is
		 * equivalent to the regex function '('.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-capturing-parentheses
		 * @return {RegExpBuilder} the current instance for methode chaining
		 * @throws {Error}
		 *             if a group is closed with no open group
		 */
		endGroup : function() {
			_popValidationCheck(_OPEN_GROUP);
			_add(")");
			return this;
		},

		/**
		 * Starts a look ahead. This is equivalent to the regex function '(?='.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-lookahead
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		startLookAheadFor : function(sText) {
			_startlookAhead(false);
			return this;
		},

		/**
		 * Ends a look ahead.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-lookahead
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		endLookAhead : function() {
			_endLookAhead();
			return this;
		},

		/**
		 * Starts a negated look ahead. This is equivalent to the regex function '(?!'.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-negated-look-ahead
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		startNegatedLookAhead : function() {
			_startlookAhead(true);
			return this;
		},

		/**
		 * Ends a negated look ahead.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-negated-look-ahead
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		endNegatedLookAhead : function() {
			_endLookAhead();
			return this;
		},

		/**
		 * Adds a matcher for the group with the specified group number. No validation is done if
		 * this group exists. This is equivalent to the regex function '\\x', where x is a group
		 * number
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @param {integer}
		 *            iGroupNumber the group number
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		useGroup : function(iGroupNumber) {
			_add("\\" + iGroupNumber);
			return this;
		},

		// ######### Other #########

		/**
		 * Sets the matcher before to not greedy mode.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-questionmark
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		withNotGreedy : function() {
			_add("?");
			return this;
		},

		/**
		 * Adds an or. This is equivalent to the regex function '|'.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-or
		 * @return {RegExpBuilder} the current instance for methode chaining
		 */
		or : function() {
			_add("|");
			return this;
		},

		/**
		 * Returns the internal representation of the regex pattern as string without wrapping '/'.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @return {string} the internal regex pattern as a string
		 */
		toString : function() {
			return _sRegExpPattern;
		},

		/**
		 * Clears all internal fields so after this methods is called the regex pattern is ''.
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @return {void}
		 */
		clear : function() {
			_sRegExpPattern = "";
			_validationStack = [];
		},

		/**
		 * Returns a new RegExp which matches exact the regex pattern which was build with the
		 * methods of this class. A validation for not closed groups is done
		 * 
		 * @public
		 * @memberof RegExpBuilder.prototype
		 * @return {RegExp} a new RegExp which matches the build pattern
		 * @throws {Error}
		 *             if open groups existing
		 */
		build : function() {
			if (_validationStack.length !== 0) {
				throw new Error(_validationStack[_validationStack.length - 1].endMissing);
			}
			return new RegExp(_sRegExpPattern);
		}
	};
}