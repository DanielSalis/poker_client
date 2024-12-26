import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
};

interface RoomFormProps {
  form: UseFormReturn<any>;
  fields: Field[];
  onSubmit: (data: any) => void;
}

export const RoomForm: React.FC<RoomFormProps> = ({ form, fields, onSubmit }) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            name={field.name}
            control={form.control}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input type={field.type || "text"} placeholder={field.placeholder} {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
  );
};
