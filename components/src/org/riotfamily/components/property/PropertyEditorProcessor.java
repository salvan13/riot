/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 * 
 * The Original Code is Riot.
 * 
 * The Initial Developer of the Original Code is
 * Neteye GmbH.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 * 
 * Contributor(s):
 *   Felix Gnass [fgnass at neteye dot de]
 * 
 * ***** END LICENSE BLOCK ***** */
package org.riotfamily.components.property;

import java.beans.PropertyEditor;

/**
 * PropertyProcessor implementation that performs conversions using a
 * PropertyEditor.
 */
public class PropertyEditorProcessor extends PropertyProcessorAdapter {

	private PropertyEditor propertyEditor;
	
	private String defaultValue;
	
	public PropertyEditorProcessor() {
	}

	public PropertyEditorProcessor(PropertyEditor propertyEditor) {
		this(propertyEditor, null);
	}
			
	public PropertyEditorProcessor(PropertyEditor propertyEditor, 
			String defaultValue) {
		
		this.propertyEditor = propertyEditor;
		setDefaultValue(defaultValue);
	}

	public void setPropertyEditor(PropertyEditor propertyEditor) {
		this.propertyEditor = propertyEditor;
	}

	public void setDefaultValue(String defaultValue) {
		this.defaultValue = defaultValue;
	}

	public synchronized Object resolveString(String value) {
		if (value == null) {
			value = defaultValue;
		}
		if (value == null) {
			return null;
		}
		propertyEditor.setAsText(value);
		return propertyEditor.getValue();
	}

	public synchronized String convertToString(Object object) {
		if (object == null) {
			return null;
		}
		propertyEditor.setValue(object);
		return propertyEditor.getAsText();
	}

}
