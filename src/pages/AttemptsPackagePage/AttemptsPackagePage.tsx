"use client";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";

// Компоненты из shadcn/ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Импортируем ваш интерфейс Product
import { Product } from "@/types/types";

const AttemptsPackagePage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // При первом монтировании загружаем продукты (у которых есть attempts и starsPrice)
  useEffect(() => {
    admin.getAllProducts();
  }, [admin]);

  // Нажатие "Добавить пакет"
  const handleAddClick = () => {
    setSelectedProduct(null); // чтобы форма открылась пустая
    setOpenDialog(true);
  };

  // Нажатие "Изменить" (в строке таблицы)
  const handleEditClick = (prod: Product) => {
    setSelectedProduct(prod);
    setOpenDialog(true);
  };

  // Сохранение нового или изменённого продукта
  const handleSave = async () => {
    if (!selectedProduct) return;

    try {
      if (selectedProduct.id) {
        // Редактируем продукт
        await admin.updateProduct(selectedProduct.id, {
          name: selectedProduct.name,
          attempts: selectedProduct.attempts,
          starsPrice: selectedProduct.starsPrice,
        });
      } else {
        // Создаём продукт
        await admin.createProduct({
          name: selectedProduct.name,
          attempts: selectedProduct.attempts,
          starsPrice: selectedProduct.starsPrice,
        });
      }

      // Обновим список, закроем диалог
      await admin.getAllProducts();
      setOpenDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Ошибка при сохранении продукта:", error);
    }
  };

  // Изменение полей формы
  const handleChangeField = (field: keyof Product, value: string) => {
    // Если selectedProduct = null, создаём объект с указанным полем
    if (!selectedProduct) {
      setSelectedProduct({
        ...({} as Product),
        [field]: field === "attempts" || field === "starsPrice" ? Number(value) : value,
      });
    } else {
      setSelectedProduct({
        ...selectedProduct,
        [field]: field === "attempts" || field === "starsPrice" ? Number(value) : value,
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Пакеты попыток за Stars</h1>

      {/* Кнопка "Добавить" */}
      <Button onClick={handleAddClick} className="mb-4">
        Добавить пакет
      </Button>

      {/* Таблица с продуктами (пакетами) */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Кол-во попыток</TableHead>
            <TableHead>Цена (звёзд)</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admin.products.map((prod) => (
            <TableRow key={prod.id}>
              <TableCell>{prod.id}</TableCell>
              <TableCell>{prod.name}</TableCell>
              <TableCell>{prod.attempts}</TableCell>
              <TableCell>{prod.starsPrice}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" onClick={() => handleEditClick(prod)}>
                  Изменить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Диалог добавления / редактирования */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProduct?.id ? "Редактировать продукт" : "Добавить продукт"}
            </DialogTitle>
            <DialogDescription>
              Заполните поля ниже и нажмите «Сохранить».
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={selectedProduct?.name || ""}
                onChange={(e) => handleChangeField("name", e.target.value)}
                placeholder="Название продукта"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="attempts">Количество попыток</Label>
              <Input
                id="attempts"
                type="number"
                value={selectedProduct?.attempts ?? ""}
                onChange={(e) => handleChangeField("attempts", e.target.value)}
                placeholder="Например: 10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="starsPrice">Цена (звёзд)</Label>
              <Input
                id="starsPrice"
                type="number"
                value={selectedProduct?.starsPrice ?? ""}
                onChange={(e) => handleChangeField("starsPrice", e.target.value)}
                placeholder="Например: 100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default AttemptsPackagePage;
