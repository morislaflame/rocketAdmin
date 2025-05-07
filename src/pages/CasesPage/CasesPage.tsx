"use client";

import React, { useContext, useEffect, useState, ChangeEvent } from "react";
import { observer } from "mobx-react-lite";
import { Context, IStoreContext } from "@/store/StoreProvider";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { CASE_DETAIL_ROUTE } from "@/utils/consts";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Импортируем toast из sonner
import { toast } from "sonner";
// Типы
import { ServerError, Case } from "@/types/types";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const CasesPage: React.FC = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;
  const navigate = useNavigate();

  // Состояния для кейсов
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);
  const [editCaseId, setEditCaseId] = useState<number | null>(null);
  const [caseName, setCaseName] = useState("");
  const [caseType, setCaseType] = useState<string>("standard");
  const [caseDescription, setCaseDescription] = useState("");
  const [_casePrice, setCasePrice] = useState<number | undefined>(0);
  const [casePriceStr, setCasePriceStr] = useState<string>("0.00");
  const [caseStarsPrice, setCaseStarsPrice] = useState<number | undefined>(0);
  const [casePointsPrice, setCasePointsPrice] = useState<number | undefined>(0);
  const [caseImageFile, setCaseImageFile] = useState<File | null>(null);
  const [isSavingCase, setIsSavingCase] = useState(false);

  // Состояние для анимаций
  const [animations, setAnimations] = useState<{ [url: string]: Record<string, unknown> }>({});

  // Состояние для вкладок статистики
  const [activeTab, setActiveTab] = useState("cases");

  // Добавьте новое состояние для отслеживания развернутых кейсов
  const [expandedCases, setExpandedCases] = useState<number[]>([]);

  // Добавьте новые состояния
  const [giveCaseDialogOpen, setGiveCaseDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isGivingCase, setIsGivingCase] = useState(false);

  // Загружаем кейсы и призы при монтировании
  useEffect(() => {
    admin.getCases().catch((err) => {
      console.error(err);
      toast.error("Ошибка при загрузке кейсов");
    });

    admin.getCasesStats().catch((err) => {
      console.error(err);
      toast.error("Ошибка при загрузке статистики кейсов");
    });
  }, [admin]);

  // Загружаем анимации для кейсов
  useEffect(() => {
    const loadAnimations = async () => {
      const newAnimations: { [url: string]: Record<string, unknown> } = {};
      for (const caseItem of admin.cases) {
        const mediaFile = caseItem.media_file;
        if (mediaFile && mediaFile.mimeType === 'application/json' && !animations[mediaFile.url]) {
          try {
            const response = await fetch(mediaFile.url);
            const data = await response.json();
            newAnimations[mediaFile.url] = data;
          } catch (error) {
            console.error(`Ошибка загрузки анимации для ${mediaFile.url}:`, error);
          }
        }
      }
      setAnimations(prev => ({ ...prev, ...newAnimations }));
    };
    loadAnimations();
  }, [admin.cases]);

  // Переход на страницу детального просмотра кейса
  const handleViewCaseDetails = (caseId: number) => {
    navigate(`${CASE_DETAIL_ROUTE}/${caseId}`);
  };

  // Создание / редактирование кейса
  const handleOpenCreateCase = () => {
    setEditCaseId(null);
    setCaseName("");
    setCaseType("standard");
    setCaseDescription("");
    setCasePrice(0);
    setCasePriceStr("0.00");
    setCaseStarsPrice(0);
    setCasePointsPrice(0);
    setCaseImageFile(null);
    setCaseDialogOpen(true);
  };

  const handleEditCase = (caseItem: Case) => {
    setEditCaseId(caseItem.id);
    setCaseName(caseItem.name);
    setCaseType(caseItem.type);
    setCaseDescription(caseItem.description || "");
    setCasePrice(caseItem.price);
    setCasePriceStr(formatTonPrice(caseItem.price));
    setCaseStarsPrice(caseItem.starsPrice);
    setCasePointsPrice(caseItem.pointsPrice);
    setCaseImageFile(null);
    setCaseDialogOpen(true);
  };

  const handleCaseFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      setCaseImageFile(file);
    } else {
      setCaseImageFile(null);
    }
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^(\d+)?(\.\d{0,2})?$/.test(value) || value === '') {
      setCasePriceStr(value);
      setCasePrice(value ? parseFloat(value) : 0);
    }
  };

  const handleSaveCase = async () => {
    try {
      setIsSavingCase(true);
      if (!caseName.trim()) {
        toast.error("Введите название кейса");
        return;
      }

      const formData = new FormData();
      formData.append("name", caseName);
      formData.append("type", caseType);
      formData.append("description", caseDescription);
      
      if (caseType !== 'free') {
        if (casePriceStr) {
          formData.append("price", parseFloat(casePriceStr).toString());
        }
        
        if (caseStarsPrice !== undefined) formData.append("starsPrice", caseStarsPrice.toString());
        if (casePointsPrice !== undefined) formData.append("pointsPrice", casePointsPrice.toString());
      }
      
      if (caseImageFile) {
        formData.append("image", caseImageFile);
      }

      if (editCaseId) {
        await admin.updateCase(editCaseId, formData);
        toast.success("Кейс успешно обновлён");
      } else {
        await admin.createCase(formData);
        toast.success("Кейс успешно создан");
      }

      await admin.getCases();
      setCaseDialogOpen(false);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при сохранении кейса:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при сохранении кейса");
    } finally {
      setIsSavingCase(false);
    }
  };

  // Обработка удаления кейса
  const handleDeleteCase = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этот кейс?")) {
      try {
        await admin.deleteCase(id);
        toast.success("Кейс успешно удален");
      } catch (error) {
        const serverError = error as ServerError;
        console.error("Ошибка при удалении кейса:", error);
        toast.error(serverError?.response?.data?.message || "Ошибка при удалении кейса");
      }
    }
  };

  // Отображение медиа файла
  const renderMedia = (item: { media_file?: any; imageUrl?: string }) => {
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
        return <img src={url} alt="Изображение" className="h-10" />;
      }
    } else if (item.imageUrl) {
      return <img src={item.imageUrl} alt="Изображение" className="h-10" />;
    }
    return "Нет";
  };

  // Отображение типа кейса или предмета
  const renderType = (type: string) => {
    switch (type) {
      case 'standard': return 'Стандартный';
      case 'author': return 'Авторский';
      case 'free': return 'Бесплатный';
      default: return type;
    }
  };

  // Добавьте функцию для переключения состояния разворачивания кейса
  const toggleCaseExpand = (caseId: number) => {
    setExpandedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId) 
        : [...prev, caseId]
    );
  };

  // Замените функцию renderStats на следующую реализацию
  const renderStats = () => {
    if (!admin.casesStats) return <p>Загрузка статистики...</p>;
    
    const { totalOpens, casesStats, topItems } = admin.casesStats;
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Популярные кейсы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Всего открытий: {totalOpens}</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Изображение</TableHead>
                  <TableHead>Открытий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {casesStats.map((caseItem: any) => (
                  <React.Fragment key={caseItem.id}>
                    <TableRow 
                      className={expandedCases.includes(caseItem.id) ? "bg-muted/50" : ""}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleCaseExpand(caseItem.id)}
                    >
                      <TableCell>
                        {expandedCases.includes(caseItem.id) ? "▼" : "▶"}
                      </TableCell>
                      <TableCell>{caseItem.name}</TableCell>
                      <TableCell>{renderType(caseItem.type)}</TableCell>
                      <TableCell>{renderMedia(caseItem)}</TableCell>
                      <TableCell>{caseItem.opensCount}</TableCell>
                    </TableRow>
                    
                    {expandedCases.includes(caseItem.id) && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={5}>
                          <div className="py-2 pl-8">
                            <h4 className="font-medium mb-2">Выпавшие предметы:</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Название</TableHead>
                                  <TableHead>Тип</TableHead>
                                  <TableHead>Значение</TableHead>
                                  <TableHead>Выпадений</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {topItems
                                  .filter((item: any) => item.caseId === caseItem.id)
                                  .map((item: any) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{renderType(item.type)}</TableCell>
                                      <TableCell>{item.value}</TableCell>
                                      <TableCell>{item.winsCount}</TableCell>
                                    </TableRow>
                                  ))}
                                {topItems.filter((item: any) => item.caseId === caseItem.id).length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center py-2">
                                      Нет данных о выпавших предметах
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // В CasesPage.tsx, добавьте функцию форматирования и используйте её при отображении
  const formatTonPrice = (price: string | number | null | undefined): string => {
    if (price === null || price === undefined) return '-';
    return Number(price).toFixed(2);
  };

  // Добавьте новую функцию для открытия диалога выдачи кейса
  const handleOpenGiveCase = (caseId: number) => {
    setSelectedCaseId(caseId);
    setUserId('');
    setQuantity(1);
    setGiveCaseDialogOpen(true);
  };

  // Добавьте функцию для выдачи кейса
  const handleGiveCase = async () => {
    if (!selectedCaseId || !userId || quantity < 1) {
      toast.error("Заполните все поля корректно");
      return;
    }

    try {
      setIsGivingCase(true);
      await admin.giveCaseToUser(Number(userId), selectedCaseId, quantity);
      toast.success("Кейс успешно выдан пользователю");
      setGiveCaseDialogOpen(false);
    } catch (error) {
      const serverError = error as ServerError;
      console.error("Ошибка при выдаче кейса:", error);
      toast.error(serverError?.response?.data?.message || "Ошибка при выдаче кейса");
    } finally {
      setIsGivingCase(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Управление кейсами</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="cases">Кейсы</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cases">
          {/* Список кейсов */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Список кейсов</h2>
              <Button onClick={handleOpenCreateCase}>Добавить кейс</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Цена TON</TableHead>
                  <TableHead>Цена звезд</TableHead>
                  <TableHead>Цена поинтов</TableHead>
                  <TableHead>Изображение</TableHead>
                  <TableHead>Предметы</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admin.cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell>{caseItem.id}</TableCell>
                    <TableCell>{caseItem.name}</TableCell>
                    <TableCell>{renderType(caseItem.type)}</TableCell>
                    <TableCell>{formatTonPrice(caseItem.price)}</TableCell>
                    <TableCell>{caseItem.starsPrice || '-'}</TableCell>
                    <TableCell>{caseItem.pointsPrice || '-'}</TableCell>
                    <TableCell>{renderMedia(caseItem)}</TableCell>
                    <TableCell>{caseItem.case_items?.length || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewCaseDetails(caseItem.id)}
                      >
                        Подробнее
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleEditCase(caseItem)}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteCase(caseItem.id)}
                      >
                        Удалить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOpenGiveCase(caseItem.id)}
                      >
                        Выдать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </TabsContent>
        
        <TabsContent value="stats">
          {renderStats()}
        </TabsContent>
      </Tabs>

      {/* Диалог создания/редактирования кейса */}
      <Dialog open={caseDialogOpen} onOpenChange={setCaseDialogOpen}>
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>{editCaseId ? "Редактировать кейс" : "Создать кейс"}</DialogTitle>
            <DialogDescription>
              Заполните поля и при необходимости загрузите изображение (до 25MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Название</Label>
              <Input
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="Название кейса"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label>Тип кейса</Label>
              <Select 
                value={caseType} 
                onValueChange={setCaseType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип кейса" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Стандартный</SelectItem>
                  <SelectItem value="author">Авторский</SelectItem>
                  <SelectItem value="free">Бесплатный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label>Описание</Label>
              <Textarea
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                placeholder="Описание кейса..."
              />
            </div>

            {caseType !== 'free' && (
              <>
                <div className="flex flex-col gap-2">
                  <Label>Цена (TON)</Label>
                  <Input
                    type="text"
                    value={casePriceStr}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label>Цена (звезды)</Label>
                  <Input
                    type="number"
                    value={caseStarsPrice}
                    onChange={(e) => setCaseStarsPrice(Number(e.target.value))}
                    placeholder="Цена в звездах"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label>Цена (поинты)</Label>
                  <Input
                    type="number"
                    value={casePointsPrice}
                    onChange={(e) => setCasePointsPrice(Number(e.target.value))}
                    placeholder="Цена в поинтах"
                  />
                </div>
              </>
            )}
            
            <div className="flex flex-col gap-2">
              <Label>Изображение (до 25 MB)</Label>
              <Input type="file" accept="image/*,application/json" onChange={handleCaseFileChange} />
              {caseImageFile && (
                <p style={{ fontSize: "12px", wordBreak: "break-all" }}>
                  Выбран файл: {caseImageFile.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveCase} disabled={isSavingCase}>
              {isSavingCase
                ? editCaseId
                  ? "Обновляем..."
                  : "Создаём..."
                : editCaseId
                ? "Обновить"
                : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Новый диалог в конец компонента (перед закрывающим тегом) */}
      <Dialog open={giveCaseDialogOpen} onOpenChange={setGiveCaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выдать кейс пользователю</DialogTitle>
            <DialogDescription>
              Введите ID пользователя и количество кейсов для выдачи
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>ID пользователя</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Введите ID пользователя"
                type="number"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label>Количество</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                placeholder="Количество кейсов"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGiveCaseDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleGiveCase} disabled={isGivingCase}>
              {isGivingCase ? "Выдаём..." : "Выдать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default CasesPage;