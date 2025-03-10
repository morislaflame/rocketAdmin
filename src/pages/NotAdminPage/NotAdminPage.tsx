import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const NotAdminPage: React.FC = () => {
    return (
        <div className="h-screen flex items-center justify-center">
            <Card className="w-[350px]">
                <CardContent className="pt-6">
                    <p className="text-center text-xl font-bold text-red-500">
                        GFYS you are not Admin
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotAdminPage;