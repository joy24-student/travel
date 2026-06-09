import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";

type AuthTextFieldProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

export function AuthTextField<T extends FieldValues>({
  control,
  name,
  label,
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
          <TextInput
            autoCapitalize="none"
            className={`rounded-xl border bg-white px-4 py-3 text-base text-gray-900 ${
              error ? "border-red-400" : "border-gray-200"
            }`}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholderTextColor="#9ca3af"
            value={(value ?? "") as string}
            {...inputProps}
          />
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
