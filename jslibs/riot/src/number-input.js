var NumberInput = {
	create: function(element, options) {
		return new NumberInput.Field(element, options);
	}
};

NumberInput.Field = Class.create();
NumberInput.Field.prototype = {

	initialize: function(element) {
		this.element = $(element);
		this.options = Object.extend({
			required: false,
			minValue: false,
			maxValue: false,
			allowFloats: false,
			precision: 2,
			decimalSeparator: '.',
			unit: null,			
			spinner: true,
			stepSize: 1,
			spinButtonTag: 'button',
			defaultValue: '0'
		}, arguments[1] || {});
		
		this.element.onkeydown = this.handleKeyDown.bindAsEventListener(this);
		this.element.onkeypress = this.handleKeyPress.bindAsEventListener(this);
		this.element.onkeyup = this.validate.bindAsEventListener(this);
		this.element.onchange = this.validate.bindAsEventListener(this);
		this.element.onblur = this.handleOnBlur.bindAsEventListener(this);

		if (!this.element.value) {
			this.setValue(this.options.defaultValue);
		}
		this.validate();
		
		if (this.options.spinner) {
			var div = document.createElement('div');
			div.className = 'numberInput';
			div.style.height = Element.getHeight(this.element) + 'px';

			var p = this.element.parentNode;
			p.insertBefore(div, this.element);
			p.removeChild(this.element);
			div.appendChild(this.element);
			this.element.style.cssFloat = this.element.style.styleFloat = 'left';

			var buttons = document.createElement('div');
			buttons.className = 'spinButtons';
			buttons.style.height = div.style.height;
			buttons.style.cssFloat = buttons.style.styleFloat = 'left';
			div.appendChild(buttons);

			new NumberInput.SpinButton(this, 'increase').appendTo(buttons);
			new NumberInput.SpinButton(this, 'decrease').appendTo(buttons);
		}
		if (this.options.unit != null) {
			var unit = document.createElement('div');
			unit.className = 'unit';
			unit.appendChild(document.createTextNode(this.options.unit));
			this.element.parentNode.appendChild(unit);
		}
		
	},

	getValue: function() {
		var v = this.element.value.length == 0 ? 0 : parseFloat(this.element.value);
		return isNaN(v) ? 0 : v;
	},

	setValue: function(v) {
		if (typeof v == 'undefined') v = this.options.defaultValue;
		if (this.isValid(v)) {
			this.element.value = v;
		}
	},
	
	isValid: function(v) {
		var value = v;
		if (typeof value == 'undefined') return false;
		var empty = (value.length == 0);
		var valid = /^-?[0-9]*([.,][0-9]*)?$/.test(value);
		if (valid) value = parseFloat(value);
		return empty || (valid && 
				(this.options.minValue === false || value >= this.options.minValue) && 
				(this.options.maxValue === false || value <= this.options.maxValue));
	},
	
	validate: function() {
		if (!this.isValid()) {
			if (this.options.minValue && this.getValue() < this.options.minValue) {
				this.setValue(this.options.minValue);
			}
			if (this.options.maxValue && this.getValue() > this.options.maxValue) {
				this.setValue(this.options.maxValue);
			}
		}
	},

	getSelectionStart: function() {
		if (typeof this.element.selectionStart != 'undefined') return this.element.selectionStart;
		var range = document.selection.createRange();
		var isCollapsed = range.compareEndPoints("StartToEnd", range) == 0;
		if (!isCollapsed) range.collapse(true);
		var b = range.getBookmark();
		return b.charCodeAt(2) - 2;
	},

	getSelectionEnd: function() {
		if (typeof this.element.selectionEnd != 'undefined') return this.element.selectionEnd;
		var range = document.selection.createRange();
		var isCollapsed = range.compareEndPoints("StartToEnd", range) == 0;
		if (!isCollapsed) range.collapse(false);
		var b = range.getBookmark();
		return b.charCodeAt(2) - 2;
	},

	isControlKey: function(code) {
		return code == Event.KEY_TAB 
			|| code == Event.KEY_RETURN
			|| code == Event.KEY_LEFT
			|| code == Event.KEY_RIGHT
			|| code == Event.KEY_DELETE
			|| code == Event.KEY_BACKSPACE
			|| code == 35 //END
			|| code == 36 //HOME
	},

	handleKeyDown: function(e) {
		// NOTE:
		// In handleKeyPress() the code for '.' is 46 which is the
		// same as for the DELETE key. Therefore we store the code
		// generated by the keydown-event, which is 190 for the 
		// dot character and 46 for DELETE.

		this.downCode = e.keyCode ? e.keyCode : e.which;
	},

	handleKeyPress: function(e) {
		//$('debug').innerHTML = this.downCode;
		
		if (this.isControlKey(this.downCode)) return true;			
		var code = e.keyCode ? e.keyCode : e.which;
		if (code == Event.KEY_UP) {
			this.increase();
			return false;
		}

		if (code == Event.KEY_DOWN) {
			this.decrease();
			return false;
		}

		var c = String.fromCharCode(code);

		// Allow miuns, if negative values are allowed, the current value is positive
		// and the cursor is at the beginning ...
		// Allow miuns, if negative values are allowed, the current value is positive
		// and the cursor is at the beginning ...
		if (c == '-' && (this.options.minValue === false || this.options.minValue < 0) 
				&& this.getValue() >= 0 && this.getSelectionStart() == 0) {

			return true;
		}
		
		if (c == this.options.decimalSeparator && this.options.allowFloats) {
			return (this.element.value.indexOf(this.options.decimalSeparator) == -1);
		}

		// Allow only numeric characters
		if (!/[0-9]/.test(c)) {
			return false;
		}

		if (this.getSelectionEnd() == this.getSelectionStart()) {
			var i = this.element.value.indexOf(this.options.decimalSeparator);
			if (i != -1 && this.getSelectionStart() > i) {
				// Cursor is behind the decimal separator
				if (this.options.precision) {
					return this.element.value.length - i <= this.options.precision; 
				}
				return true;
			}

			if (this.getValue() >= 0) {
				if (!this.options.minValue === false) {
					// Check if the current value already has the maximum string length ...
					if (this.options.maxValue && 
							Math.floor(this.getValue()).toString().length == 
							Math.floor(this.options.maxValue).toString().length) {

						return false;
					}
				}
			}
			else {
				// For negative values we need to check the minValue
				if (!this.options.minValue === false) {
					if (Math.ceil(this.getValue()).toString().length == 
							Math.ceil(this.options.minValue).toString().length) {

						return false;
					}
				}
			}
		}
		
		return true;
	},

	increase: function() {
		var v = this.getValue() + this.options.stepSize;
		var d = Math.pow(10, this.options.precision);
		this.setValue(Math.round(v * d) / d);
	},

	decrease: function() {
		var v = this.getValue() - this.options.stepSize;
		var d = Math.pow(10, this.options.precision);
		this.setValue(Math.round(v * d) / d);
	},
	
	handleOnBlur: function() {
		if (this.options.required) {
			if ((typeof this.element.value == 'undefined') || value.length == 0) 
				this.setValue(this.options.defaultValue);
		}
		this.validate();
	}

}

NumberInput.SpinButton = Class.create();
NumberInput.SpinButton.prototype = {
	initialize: function(field, action) {
		this.field = field;
		this.func = this.field[action].bind(field);
		this.delay = 100;

		this.element = document.createElement(field.options.spinButtonTag);
		this.element.className = action;
		this.element.innerHTML = action;
		Element.setStyle(this.element, {
			height: '50%',
			fontSize: '1px',
			overflow: 'hidden',
			textIndent: '-100px'
		});

		this.element.onmousedown = this.start.bindAsEventListener(this);
		this.element.onmouseup = this.stop.bindAsEventListener(this);
		this.element.onmouseout = this.stop.bindAsEventListener(this);
		this.element.onclick = function() { return false };
	},

	appendTo: function(e) {
		e.appendChild(this.element);
	},

	start: function() {
		this.func();
		//TODO Decrease delay smoothly ... 
		this.timeout = setTimeout(this.start.bind(this), this.delay);
	},

	stop: function() {
		if (this.timeout) clearTimeout(this.timeout);
	}

}
