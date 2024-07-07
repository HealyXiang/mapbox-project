/* eslint-disable react/prop-types */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username must be at least 1 characters.",
  }),
  address: z.string().min(1, {
    message: "Address must be at least 1 characters.",
  }),
  latitude: z.string().min(1, {
    message: "Latitude must be at least 1 characters.",
  }),
  longitude: z.string().min(1, {
    message: "Longitude must be at least 1 characters.",
  }),
});

// {
//   "name": "ueJzLCQCsz",
//   "address": "vwyuuuJspqAAMqX",
//   "service": "Service 1",
//   "category": "ERyAkMPB",
//   "location": {
//       "latitude": 28.215402513093096,
//       "longitude": 110.2155056585441
//   },
//   "timestamp": "2024-06-06T17:02:45.844611"
// },
const formItems = [
  {
    formItemKey: "username",
    formItemLabel: "姓名",
    formItemPlaceholder: "请输入用户姓名",
  },
  {
    formItemKey: "address",
    formItemLabel: "地址",
    formItemPlaceholder: "请输入地址信息",
  },
  {
    formItemKey: "latitude",
    formItemLabel: "纬度",
    formItemPlaceholder: "请输入纬度数字",
  },
  {
    formItemKey: "longitude",
    formItemLabel: "经度",
    formItemPlaceholder: "请输入经度数字",
  },
];

export default function AddUserForm({ handleSubmit }) {
  // ...
  const onSubmit = (values) => {
    const newUserData = [
      {
        name: values.username,
        address: values.address,
        service: "Service 1",
        category: "ERyAkMPB",
        location: {
          latitude: +values.latitude || 0,
          longitude: +values.longitude || 0,
        },
        timestamp: "2024-06-06T17:02:45.844611",
      },
    ];
    handleSubmit && handleSubmit(newUserData);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      address: "",
      latitude: "",
      longitude: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
        {formItems.map(
          ({ formItemKey, formItemLabel, formItemPlaceholder }) => (
            <FormField
              key={formItemKey}
              control={form.control}
              name={formItemKey}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{formItemLabel}:</FormLabel>
                  <FormControl>
                    <Input
                      // type="number"
                      placeholder={formItemPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        )}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
