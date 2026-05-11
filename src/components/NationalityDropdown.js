import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { assets } from "../config/AssetsConfig";

export default function NationalityDropdown({ selected, flag, onPress }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Nationality</Text>

      <TouchableOpacity style={styles.dropdown} onPress={onPress}>
        <View style={styles.row}>
          {flag && (
           <Text style={styles.value}>{flag}</Text>
          )}

          <Text style={[styles.value,{marginLeft:10}]}>{selected?.length ? selected : 'Select Nationality'}</Text>
        </View>

        <Image
            source={assets.chevron}
            style={{width: 20, height: 20, marginTop: 7}}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },

  label: {
    fontSize: 15,
    color: "#6D6D6D",
    marginBottom: 6,
    fontFamily: 'Gotham-Medium',
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  flag: {
    width: 22,
    height: 22,
    borderRadius: 4,
    marginRight: 10,
  },

  value: {
    color: "#000",
    fontSize: 16,
    // fontFamily: 'Gotham-Medium',
  },
});