/// Define element related types and functions
use log::{debug, error}; // add trace, warn and error as needed
use serde::{Deserialize, Serialize};
use std::fmt;
use std::ops::{Index, IndexMut};

// TODO can elements be negative?
/// Structure to organize elements (with void)
#[derive(Deserialize, Serialize, Debug, Default, Clone, Copy)]
pub struct Elements {
    pub air: i32,
    pub fire: i32,
    pub lightning: i32,
    pub water: i32,
    pub wood: i32,
    pub void: i32,
}

/// Structure to organize elements (without void)
#[derive(Deserialize, Serialize, Debug, Default, Clone, Copy)]
pub struct ElementsNoVoid {
    air: u32,
    fire: u32,
    lightning: u32,
    water: u32,
    wood: u32,
}

/// Structure to manage ordered elements (from highest to lowest)
/// The current element can be deduced from the ordered indexes array and the current index
#[derive(Deserialize, Serialize, Debug, Default, Clone)]
pub struct OrderedElements {
    /// The elements in the classic order (0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void)
    pub elements: Elements,
    /// The indexes of the elements ordered from highest element value to lowest
    pub ordered_indexes: [ElementIndex; 6],
    /// List of skipped elements if any
    pub skipped_indexes: Vec<ElementIndex>,
    /// The current index to be used in ordered_indexes
    pub current_index: usize,
}

/// Elements are expected to be organized the following way in an array:
/// 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void
/// This enum helps access those values easily and consistently.
/// Note: Void can be optional (if the array is of size 5, void is just not there)
#[derive(PartialEq, Deserialize, Serialize, Debug, Copy, Clone)]
pub enum ElementIndex {
    Fire = 0,
    Wood,
    Water,
    Lightning,
    Air,
    Void,
}

impl Index<ElementIndex> for Elements {
    type Output = i32;

    /// Implement the Index trait based on ElementIndex for Element
    fn index(&self, element_index: ElementIndex) -> &Self::Output {
        match element_index {
            ElementIndex::Air => &self.air,
            ElementIndex::Fire => &self.fire,
            ElementIndex::Lightning => &self.lightning,
            ElementIndex::Water => &self.water,
            ElementIndex::Wood => &self.wood,
            ElementIndex::Void => &self.void,
        }
    }
}

impl IndexMut<ElementIndex> for Elements {
    /// Implement the IndexMut trait based on ElementIndex for Element
    fn index_mut(&mut self, element_index: ElementIndex) -> &mut Self::Output {
        match element_index {
            ElementIndex::Air => &mut self.air,
            ElementIndex::Fire => &mut self.fire,
            ElementIndex::Lightning => &mut self.lightning,
            ElementIndex::Water => &mut self.water,
            ElementIndex::Wood => &mut self.wood,
            ElementIndex::Void => &mut self.void,
        }
    }
}

impl Index<ElementIndex> for OrderedElements {
    type Output = i32;

    /// Implement the Index trait based on ElementIndex for OrderedElement
    fn index(&self, element_index: ElementIndex) -> &Self::Output {
        match element_index {
            ElementIndex::Air => &self.elements.air,
            ElementIndex::Fire => &self.elements.fire,
            ElementIndex::Lightning => &self.elements.lightning,
            ElementIndex::Water => &self.elements.water,
            ElementIndex::Wood => &self.elements.wood,
            ElementIndex::Void => &self.elements.void,
        }
    }
}

impl IndexMut<ElementIndex> for OrderedElements {
    /// Implement the IndexMut trait based on ElementIndex for OrderedElements
    fn index_mut(&mut self, element_index: ElementIndex) -> &mut Self::Output {
        match element_index {
            ElementIndex::Air => &mut self.elements.air,
            ElementIndex::Fire => &mut self.elements.fire,
            ElementIndex::Lightning => &mut self.elements.lightning,
            ElementIndex::Water => &mut self.elements.water,
            ElementIndex::Wood => &mut self.elements.wood,
            ElementIndex::Void => &mut self.elements.void,
        }
    }
}

impl fmt::Display for ElementIndex {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ElementIndex::Air => write!(f, "air"),
            ElementIndex::Fire => write!(f, "fire"),
            ElementIndex::Lightning => write!(f, "lightning"),
            ElementIndex::Void => write!(f, "void"),
            ElementIndex::Water => write!(f, "water"),
            ElementIndex::Wood => write!(f, "wood"),
        }
    }
}

impl ElementIndex {
    fn next(self) -> Self {
        match self {
            ElementIndex::Air => ElementIndex::Void,
            ElementIndex::Fire => ElementIndex::Wood,
            ElementIndex::Wood => ElementIndex::Water,
            ElementIndex::Water => ElementIndex::Lightning,
            ElementIndex::Lightning => ElementIndex::Air,
            ElementIndex::Void => ElementIndex::Fire,
        }
    }

    fn next_no_void(self) -> Self {
        // Point void to void and wood to air
        match self {
            ElementIndex::Air => ElementIndex::Void,
            ElementIndex::Fire => ElementIndex::Wood,
            ElementIndex::Wood => ElementIndex::Water,
            ElementIndex::Water => ElementIndex::Lightning,
            ElementIndex::Lightning => ElementIndex::Air,
            ElementIndex::Void => ElementIndex::Void,
        }
    }
}

impl OrderedElements {
    // TODO if tied, it's actually random
    fn get_order_from_elements(elements: Elements) -> [ElementIndex; 6] {
        let mut ordered_elements_array: [ElementIndex; 6] = [ElementIndex::Void; 6];
        let temp_elements = elements;
        // Start from void here so that if there is a tie between air and another, air is first
        let mut current_index: ElementIndex = ElementIndex::Void;
        // List of elements already sorted that need to be skipped later
        let mut skip_list: Vec<ElementIndex> = Vec::new();
        for i in 0..6 {
            // Get the max element
            ordered_elements_array[i] = temp_elements
                .get_max_element_index_after_index_with_skip(current_index, &skip_list);
            // Add it to the skip list for next iterations
            skip_list.push(ordered_elements_array[i]);
            // Repeat starting from the index found
            current_index = ordered_elements_array[i];
        }
        ordered_elements_array
    }
}

impl Elements {
    /// Create an elements from an Array ordered accordingly to 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void
    /// Take an element array array to create the Elements from
    /// Returns the elements value in an Elements struct
    pub fn from_array(elements: [i32; 6]) -> Self {
        Self {
            air: elements[ElementIndex::Air as usize],
            fire: elements[ElementIndex::Fire as usize],
            lightning: elements[ElementIndex::Lightning as usize],
            water: elements[ElementIndex::Water as usize],
            wood: elements[ElementIndex::Wood as usize],
            void: elements[ElementIndex::Void as usize],
        }
    }

    /// Create an elements from an Array ordered accordingly to 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air
    /// PARAM:   - elements: [u32;5] - the array to create the Elements from
    /// RETURN:  Elements - The elements value in an Elements struct
    pub fn from_array_no_void(elements: [i32; 5]) -> Self {
        Self {
            air: elements[ElementIndex::Air as usize],
            fire: elements[ElementIndex::Fire as usize],
            lightning: elements[ElementIndex::Lightning as usize],
            water: elements[ElementIndex::Water as usize],
            wood: elements[ElementIndex::Wood as usize],
            void: 0,
        }
    }

    /// PURPOSE: Convert the Element into an array [u32; 6]
    /// RETURN:  [u32; 6] The elements ordered according to 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void
    pub fn to_array(&self) -> [i32; 6] {
        let elements_array: [i32; 6] = [
            self.fire,
            self.wood,
            self.water,
            self.lightning,
            self.air,
            self.void,
        ];
        elements_array
    }

    /// PURPOSE: Convert the Element into an array [u32; 5]
    /// RETURN:  [u32; 5] The elements ordered according to 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air
    pub fn to_array_no_void(self) -> [i32; 5] {
        let elements_array: [i32; 5] = [self.fire, self.wood, self.water, self.lightning, self.air];
        elements_array
    }

    /// PURPOSE: Return the next element value from an index
    /// PARAM:   - index: ElementIndex - The index to use as a starting point
    /// RETURN:  u32 - The value of the next element
    pub fn next_element_from_index(self, index: ElementIndex) -> i32 {
        self[index.next()]
    }

    /// PURPOSE: Return the highest element
    /// PARAM:   None
    /// RETURN:  u32 - The highest element value
    pub fn get_max_element_value(self) -> i32 {
        let mut max: i32 = self.air;
        let mut index: ElementIndex = ElementIndex::Air.next();
        for _i in 0..6 {
            if self[index] > max {
                max = self[index];
            }
            index = index.next();
        }
        max
    }

    /// PURPOSE: Return the index of the highest element (in case of equality returns the smallest index)
    /// PARAM:   None
    /// RETURN:  u32 - The index of the highest element value
    pub fn get_max_element_index(self) -> ElementIndex {
        let max: i32 = self.get_max_element_value();
        let mut index: ElementIndex = ElementIndex::Air;
        for _i in 0..6 {
            if self[index] == max {
                break;
            } else {
                index = index.next();
            }
        }
        index
    }

    // TODO per the in game help, in case of a tie, it's random (but seems decided once before a fight)
    /// PURPOSE: Return the index of the highest element (in case of equality returns the next one according to the index given in argument)
    ///          Also provide the possibility to give a list of elements to skip
    /// PARAM:   None
    /// RETURN:  u32 - The index of the highest element value
    pub fn get_max_element_index_after_index_with_skip(
        self,
        index: ElementIndex,
        skip_list: &Vec<ElementIndex>,
    ) -> ElementIndex {
        let max: i32 = self.get_max_element_value();
        // Start from the next one after the given index
        let mut current_index: ElementIndex = index.next();

        for _i in 0..6 {
            if self[current_index] == max && !skip_list.contains(&current_index) {
                break;
            } else {
                current_index = current_index.next();
            }
        }
        current_index
    }
}

impl OrderedElements {
    //--------------------------    -------------------------------------------------------------------------------------------
    // PURPOSE: Return an OrderedElement object from an Element object
    // PARAM:   - elements: Element - The elements
    // RETURN:  OrderedElements - The OrderedElement object
    //---------------------------------------------------------------------------------------------------------------------
    pub fn from_elements(elements: Elements) -> Self {
        Self {
            elements,
            ordered_indexes: Self::get_order_from_elements(elements),
            skipped_indexes: Vec::new(),
            current_index: 0,
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Return an OrderedElement object from an array of element
    //          ordered according to 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air, 5 - Void
    // PARAM:   - elements_array: [u32; 6] - The array of elements
    // RETURN:  OrderedElements - The OrderedElement object
    //---------------------------------------------------------------------------------------------------------------------
    pub fn from_elements_array(elements_array: [i32; 6]) -> Self {
        let elements: Elements = Elements::from_array(elements_array);
        Self {
            elements,
            ordered_indexes: Self::get_order_from_elements(elements),
            skipped_indexes: vec![],
            current_index: 0,
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Return an OrderedElement object from an array of element without void
    //          ordered according to 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air
    // PARAM:   - elements_array: [u32; 5] - The array of elements without void
    // RETURN:  OrderedElements - The OrderedElement object
    //---------------------------------------------------------------------------------------------------------------------
    pub fn from_elements_array_no_void(elements_array: [i32; 5]) -> Self {
        let elements: Elements = Elements::from_array_no_void(elements_array);
        Self {
            elements,
            ordered_indexes: Self::get_order_from_elements(elements),
            skipped_indexes: vec![],
            current_index: 0,
        }
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Return an OrderedElement object from an Element object
    // PARAM:   - elements: Element - The elements
    // RETURN:  OrderedElements - The OrderedElement object
    //---------------------------------------------------------------------------------------------------------------------
    pub fn add_skipped_element(&mut self, index: ElementIndex) {
        self.skipped_indexes.push(index);
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Increment the current index and return its new value, considering the skipped ones
    // PARAM:   None
    // RETURN:  usize - The next index in the order
    //---------------------------------------------------------------------------------------------------------------------
    pub fn increment_current_index(&mut self) -> usize {
        let current: usize = self.current_index;
        let mut increment: usize = 1;

        debug!("Current index is {:}, increment is {:}", current, increment);

        // Increase the increment if the next one is skipped
        while self
            .skipped_indexes
            .contains(&self.ordered_indexes[(current + increment) % 6])
        {
            increment += 1;
            debug!("New increment {:}", increment);
            // 7 means: the base of 1, then 6 elements are skipped that means all of them!
            if increment == 7 {
                error!("Error incrementing elements, all skipped!");
                break;
            }
        }
        self.current_index = (current + increment) % 6;
        debug!("New current index {:}", self.current_index);
        self.current_index
    }

    //---------------------------------------------------------------------------------------------------------------------
    // PURPOSE: Return the current element index (this is different from the current_index property)
    // PARAM:   None
    // RETURN:  ElementIndex - The element index of the current element
    //---------------------------------------------------------------------------------------------------------------------
    pub fn get_current_element_index(&self) -> ElementIndex {
        self.ordered_indexes[self.current_index]
    }
}

impl Default for ElementIndex {
    fn default() -> Self {
        ElementIndex::Void
    }
}
