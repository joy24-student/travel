import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Text, TextInput, TextInputProps, View, StyleSheet } from "react-native";

type AuthTextFieldProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function AuthTextField<T extends FieldValues>({
  control,
  name,
  label,
  leftIcon,
  rightIcon,
  ...inputProps
}: AuthTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onBlur, onChange, value },
        fieldState: { error },
      }) => (
        <View className="mb-4">
          <Text className="mb-2 text-sm font-bold text-gray-700">{label}</Text>
          <View style={styles.inputWrapper}>
            {leftIcon && (
              <View style={styles.leftIcon}>
                {leftIcon}
              </View>
            )}
            <TextInput
              autoCapitalize="none"
              className={`rounded-xl border bg-white py-3 text-base text-gray-900 ${
                error ? "border-red-400" : "border-gray-200"
              }`}
              style={{
                paddingLeft: leftIcon ? 44 : 16,
                paddingRight: rightIcon ? 44 : 16,
                width: '100%',
              }}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholderTextColor="#9ca3af"
              value={(value ?? "") as string}
              {...inputProps}
            />
            {rightIcon && (
              <View style={styles.rightIcon}>
                {rightIcon}
              </View>
            )}
          </View>
          {error?.message ? (
            <Text className="mt-1 text-xs font-semibold text-red-500">
              {error.message}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  leftIcon: {
    position: "absolute",
    left: 12,
    zIndex: 10,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    zIndex: 10,
  },
});
