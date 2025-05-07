"use client";

import React, { useContext, useEffect, useState, ChangeEvent } from "react";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Импортируем toast из sonner
import { toast } from "sonner";
// Типы
import { Case, CaseItem, ServerError } from "@/types/types";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const CaseDetailPage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Состояние для хранения данных кейса
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [animations, setAnimations] = useState<{ [url: string]: Record<string, unknown> }>({});
  
  // Состояния для диалога добавления/редактирования предмета
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState<string>("attempts");
  const [itemValue, setItemValue] = useState<number | undefined>(0);
  const [itemProbability, setItemProbability] = useState<number>(0);
  const [selectedPrizeId, setSelectedPrizeId] = useState<number | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Добавьте стейт для хранения строкового значения (для ввода)
  const [_casePriceStr, setCasePriceStr] = useState("");

  // Загрузка данных о кейсе и призах при монтировании
  useEffect(() => {
    if (!id) return;
    
    // Загрузка кейса
    admin.getCaseById(Number(id))
      .then(data => {
        setCaseData(data);
        // В useEffect при заполнении данных для редактирования
        setCasePriceStr(data.price ? data.price.toFixed(2) : "0.00");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Ошибка при загрузке кейса");
      });

    // Загрузка призов для выбора
    admin.getAllPrizes().catch((err) => {
      console.error(err);
      toast.error("Ошибка при загрузке призов");
    });
  }, [admin, id]);

  // Загрузка анимаций для предметов
  useEffect(() => {
    if (!caseData) return;
    
    const loadAnimations = async () => {
      const newAnimations: { [url: string]: Record<string, unknown> } = {};
      
      // Проверяем анимацию самого кейса
      const caseMediaFile = caseData.media_file;
      if (caseMediaFile && caseMediaFile.mimeType === 'application/json' && !animations[caseMediaFile.url]) {
        try {
          const response = await fetch(caseMediaFile.url);
          const data = await response.json();
          newAnimations[caseMediaFile.url] = data;
        } catch (error) {
          console.error(`Ошибка загрузки анимации для кейса:`, error);
        }
      }
      
      // Проверяем анимации предметов и призов
      if (caseData.case_items) {
        for (const item of caseData.case_items) {
          // Проверка для самого предмета
          const mediaFile = item.media_file;
          if (mediaFile && mediaFile.mimeType === 'application/json' && !animations[mediaFile.url]) {
            try {
              const response = await fetch(mediaFile.url);
              const data = await response.json();
              newAnimations[mediaFile.url] = data;
            } catch (error) {
              console.error(`Ошибка загрузки анимации для предмета:`, error);
            }
          }
          
          // Проверка для приза, если предмет типа "prize"
          if (item.type === 'prize' && item.prize?.media_file) {
            const prizeFile = item.prize.media_file;
            if (prizeFile.mimeType === 'application/json' && !animations[prizeFile.url]) {
              try {
                const response = await fetch(prizeFile.url);
                const data = await response.json();
                newAnimations[prizeFile.url] = data;
              } catch (error) {
                console.error(`Ошибка загрузки анимации для приза:`, error);
              }
            }
          }
        }
      }
      
      if (Object.keys(newAnimations).length > 0) {
        setAnimations(prev => ({ ...prev, ...newAnimations }));
      }
    };
    
    loadAnimations();
  }, [caseData, animations]);

  // Загрузка анимаций для призов
  useEffect(() => {
    if (!admin.prizes || admin.prizes.length === 0) return;
    
    const loadPrizeAnimations = async () => {
      const newAnimations: { [url: string]: Record<string, unknown> } = {};
      
      for (const prize of admin.prizes) {
        if (prize.media_file && prize.media_file.mimeType === 'application/json' && !animations[prize.media_file.url]) {
          try {
            const response = await fetch(prize.media_file.url);
            const data = await response.json();
            newAnimations[prize.media_file.url] = data;
          } catch (error) {
            console.error(`Ошибка загрузки анимации для приза ${prize.name}:`, error);
          }
        }
      }
      
      if (Object.keys(newAnimations).length > 0) {
        setAnimations(prev => ({ ...prev, ...newAnimations }));
      }
    };
    
    loadPrizeAnimations();
  }, [admin.prizes]);

  // Обработчики для работы с предметами
  const handleOpenAddItemDialog = () => {
    setEditItemId(null);
    setItemName("");
    setItemType("attempts");
    setItemValue(0);
    setItemProbability(0);
    setSelectedPrizeId(null);
    setItemImageFile(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: CaseItem) => {
    setEditItemId(item.id);
    setItemName(item.name);
    setItemType(item.type);
    setItemValue(item.value || 0);
    setItemProbability(item.probability);
    setSelectedPrizeId(item.rafflePrizeId || null);
    setItemImageFile(null);
    setItemDialogOpen(true);
  };

  const handleItemFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Максимальный размер файла: 25MB");
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/json'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Разрешены только изображения и JSON-файлы");
        return;
      }
      setItemImageFile(file);
    } else {
      setItemImageFile(null);
    }
  };

  const handleSaveItem = async () => {
    if (!caseData) return;
    
    try {
      setIsSavingItem(true);
      
      if (!itemName.trim()) {
        toast.error("Введите название предмета");
        setIsSavingItem(false);
        return;
      }
      
      if (itemProbability < 0 || itemProbability > 100) {
        toast.error("Вероятность должна быть от 0 до 100");
        setIsSavingItem(false);
        return;
      }
      
      if (itemType === 'prize' && !selectedPrizeId) {
        toast.error("Выберите приз");
        setIsSavingItem(false);
        return;
      }
      
      // Проверяем суммарную вероятность
      let totalProbability = 0;
      if (caseData.case_items) {
        for (const item of caseData.case_items) {
          if (editItemId !== item.id) {
            totalProbability += item.probability;
          }
        }
      }
      
      if (totalProbability + itemProbability > 100) {
        toast.error(`Суммарная вероятность не может превышать 100%. Текущая сумма без этого предмета: ${totalProbability}%`);
        setIsSavingItem(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", itemName);
      formData.append("type", itemType);
      
      if (itemValue !== undefined && (itemType === 'attempts' || itemType === 'tickets')) {
        formData.append("value", itemValue.toString());
      }
      
      formData.append("probability", itemProbability.toString());
      
      if (itemType === 'prize' && selectedPrizeId) {
        formData.append("rafflePrizeId", selectedPrizeId.toString());
      }
      
      if (itemImageFile) {
        formData.append("image", itemImageFile);
      }

      let updatedItem;
      if (editItemId) {
        // Обновление существующего предмета
        updatedItem = await admin.updateCaseItem(editItemId, Number(id), formData);
        toast.success("Предмет успешно обновлен");
      } else {
        // Создание нового предмета
        updatedItem = await admin.addCaseItem(Number(id), formData);
        toast.success("Предмет успешно добавлен");
      }

      // Обновляем данные кейса
      const updatedCase = await admin.getCaseById(Number(id));
      setCaseData(updatedCase);
      
      setItemDialogOpen(false);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при сохранении предмета:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при сохранении предмета");
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этот предмет?")) {
      try {
        await admin.deleteCaseItem(itemId, Number(id));
        toast.success("Предмет успешно удален");
        
        // Обновляем данные кейса
        const updatedCase = await admin.getCaseById(Number(id));
        setCaseData(updatedCase);
      } catch (error) {
        const serverError = error as ServerError;
        console.error("Ошибка при удалении предмета:", error);
        toast.error(serverError?.response?.data?.message || "Ошибка при удалении предмета");
      }
    }
  };

  // Отображение типа предмета
  const renderItemType = (type: string) => {
    switch (type) {
      case 'attempts': return 'Попытки';
      case 'tickets': return 'Тикеты';
      case 'prize': return 'Приз';
      default: return type;
    }
  };

  // Отображение медиа файла с дополнительной диагностикой
  const renderMedia = (item: { 
    media_file?: any; 
    imageUrl?: string | null; 
    name?: string;
    type?: string;
    prize?: {
      media_file?: any;
      imageUrl?: string | null;
    }
  }) => {
    // Если это приз, используем изображение из объекта приза
    if (item.type === 'prize' && item.prize) {
      const prizefile = item.prize.media_file;
      if (prizefile) {
        const { url, mimeType } = prizefile;
        if (mimeType === 'application/json' && animations[url]) {
          return (
            <div className="flex justify-center">
              <Lottie
                animationData={animations[url]}
                loop={true}
                autoplay={true}
                style={{ width: 40, height: 40 }}
              />
            </div>
          );
        } else if (mimeType?.startsWith('image/')) {
          return (
            <div className="flex justify-center">
              <img 
                src={url} 
                alt="Изображение" 
                className="h-15 object-contain bg-black p-2 rounded-md"
              />
            </div>
          );
        }
      }
      
      if (item.prize.imageUrl) {
        return (
          <div className="flex justify-center">
            <img 
              src={item.prize.imageUrl} 
              alt="Изображение" 
              className="h-15 object-contain bg-black p-2 rounded-md"
            />
          </div>
        );
      }
    }
    
    // Стандартное отображение для не-призов
    const mediaFile = item.media_file;
    if (mediaFile) {
      const { url, mimeType } = mediaFile;
      if (mimeType === 'application/json' && animations[url]) {
        return (
          <Lottie
            animationData={animations[url]}
            loop={true}
            autoplay={true}
            style={{ width: 40, height: 40 }}
          />
        );
      } else if (mimeType?.startsWith('image/')) {
        // Увеличим размер для лучшей видимости
        return (
          <div className="flex justify-center">
            <img 
              src={url} 
              alt="Изображение" 
              className="h-15 object-contain bg-black p-2 rounded-md"
              onError={(e) => {
                console.error('Ошибка загрузки изображения:', url);
                e.currentTarget.src = item.imageUrl || '';
                e.currentTarget.onerror = null;
              }} 
            />
          </div>
        );
      }
    }
    
    if (item.imageUrl) {
      return (
        <div className="flex justify-center">
          <img 
            src={item.imageUrl} 
            alt="Изображение" 
            className="h-12 object-contain"
            onError={(_e) => console.error('Ошибка загрузки imageUrl:', item.imageUrl)} 
          />
        </div>
      );
    }
    
    return "Нет";
  };

  // Вычисление общей вероятности
  const calculateTotalProbability = () => {
    if (!caseData?.case_items) return 0;
    return caseData.case_items.reduce((sum, item) => sum + item.probability, 0);
  };

  // 1. Добавьте функцию для форматирования цены TON
  const formatTonPrice = (price: string | number | null | undefined): string => {
    if (price === null || price === undefined) return '-';
    return Number(price).toFixed(2);
  };


  if (!caseData) {
    return <div className="p-4">Загрузка данных кейса...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mr-2">
          Назад
        </Button>
        <h1 className="text-xl font-bold">Кейс: {caseData.name}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Информация о кейсе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>ID:</strong> {caseData.id}</p>
              <p><strong>Название:</strong> {caseData.name}</p>
              <p><strong>Тип:</strong> {caseData.type === 'standard' ? 'Стандартный' : 
                                     caseData.type === 'author' ? 'Авторский' : 'Бесплатный'}</p>
              <p><strong>Описание:</strong> {caseData.description || 'Не указано'}</p>
              {caseData.type !== 'free' && (
                <>
                  <p><strong>Цена TON:</strong> {formatTonPrice(caseData.price)}</p>
                  <p><strong>Цена звезд:</strong> {caseData.starsPrice || '-'}</p>
                  <p><strong>Цена поинтов:</strong> {caseData.pointsPrice || '-'}</p>
                </>
              )}
              <p><strong>Активен:</strong> {caseData.isActive ? 'Да' : 'Нет'}</p>
            </div>
            <div className="flex justify-center items-center">
              {renderMedia(caseData)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Предметы кейса</h2>
          <p>Общая вероятность: {calculateTotalProbability()}% (максимум 100%)</p>
        </div>
        <Button onClick={handleOpenAddItemDialog}>Добавить предмет</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Значение</TableHead>
            <TableHead>Вероятность</TableHead>
            <TableHead>Изображение</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {caseData.case_items && caseData.case_items.length > 0 ? (
            caseData.case_items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{renderItemType(item.type)}</TableCell>
                <TableCell>
                  {item.type === 'attempts' ? `${item.value} попыток` :
                   item.type === 'tickets' ? `${item.value} тикетов` :
                   item.type === 'prize' && item.prize ? item.prize.name : '-'}
                </TableCell>
                <TableCell>{item.probability}%</TableCell>
                <TableCell>{renderMedia(item)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditItem(item)}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                В этом кейсе пока нет предметов
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Диалог создания/редактирования предмета */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>{editItemId ? "Редактировать предмет" : "Добавить предмет"}</DialogTitle>
            <DialogDescription>
              Заполните поля и при необходимости загрузите изображение (до 25MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Название</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Название предмета"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label>Тип предмета</Label>
              <Select 
                value={itemType} 
                onValueChange={setItemType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип предмета" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attempts">Попытки</SelectItem>
                  <SelectItem value="tickets">Тикеты</SelectItem>
                  <SelectItem value="prize">Приз</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(itemType === 'attempts' || itemType === 'tickets') && (
              <div className="flex flex-col gap-2">
                <Label>{itemType === 'attempts' ? 'Количество попыток' : 'Количество тикетов'}</Label>
                <Input
                  type="number"
                  value={itemValue}
                  onChange={(e) => setItemValue(Number(e.target.value))}
                  placeholder="Введите количество"
                />
              </div>
            )}
            
            {itemType === 'prize' && (
              <div className="flex flex-col gap-2">
                <Label>Выберите приз</Label>
                <Select 
                  value={selectedPrizeId?.toString() || ""} 
                  onValueChange={(value) => setSelectedPrizeId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите приз" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {admin.prizes.map((prize) => (
                      <SelectItem key={prize.id} value={prize.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-black rounded-md overflow-hidden flex items-center justify-center">
                            {prize.media_file?.mimeType === 'application/json' && animations[prize.media_file.url] ? (
                              <Lottie 
                                animationData={animations[prize.media_file.url]} 
                                style={{ width: 30, height: 30 }} 
                                loop={true} 
                                autoplay={true} 
                              />
                            ) : prize.media_file ? (
                              <img 
                                src={prize.media_file.url} 
                                alt="" 
                                className="max-w-full max-h-full object-contain" 
                              />
                            ) : prize.imageUrl ? (
                              <img 
                                src={prize.imageUrl} 
                                alt="" 
                                className="max-w-full max-h-full object-contain" 
                              />
                            ) : (
                              <span className="text-xs text-gray-400">Нет</span>
                            )}
                          </div>
                          <span className="ml-1">{prize.name} ({prize.value} руб.)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Label>Вероятность выпадения (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={itemProbability}
                onChange={(e) => setItemProbability(Number(e.target.value))}
                placeholder="Введите вероятность (0-100)"
              />
              <p className="text-sm text-gray-600">
                Текущая суммарная вероятность: {calculateTotalProbability()}% 
                {editItemId ? ` (без этого предмета: ${calculateTotalProbability() - (caseData.case_items.find(item => item.id === editItemId)?.probability || 0)}%)` : ''}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label>Изображение (до 25 MB)</Label>
              <Input 
                type="file" 
                accept="image/*,application/json" 
                onChange={handleItemFileChange} 
              />
              {itemImageFile && (
                <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
                  Выбран файл: {itemImageFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveItem} disabled={isSavingItem}>
              {isSavingItem
                ? editItemId
                  ? "Обновляем..."
                  : "Создаём..."
                : editItemId
                ? "Обновить"
                : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default CaseDetailPage;
