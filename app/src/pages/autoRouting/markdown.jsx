// app/src/pages/autoRouting/markdown.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeftCircle } from 'lucide-react';
import { AutoResizeTextarea } from '../../components/ui/textarea';
import { Card, CardFooter } from '../../components/ui/card';
import MarkdownDisplay from '../../components/ui/markdown';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

function TestMarkdown() {
  const [title, setTitle] = useState('تعليمات التصميم');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/docs/markdown-guide.md')
      .then((response) => response.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading markdown:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto min-h-screen p-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Section */}
        <Card className="space-y-6 p-6">
          <h2 className="text-xl font-bold">Markdown حقل تجارب</h2>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="title">العنوان</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أكتب عنوان..."
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="content">المحتوى (Markdown)</Label>
            <AutoResizeTextarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="أكتب محتوى Markdown هنا..."
            />
          </div>

          <div className="flex items-center gap-2 space-x-2">
            <Checkbox
              id="loading"
              checked={loading}
              className="m-2"
              onCheckedChange={setLoading}
            />
            <Label htmlFor="loading">رؤية صفحة التحميل</Label>
          </div>

          <CardFooter>
            <Link to="/">
              <Button variant="outline" size="wide">
                <ChevronLeftCircle className="ml-2 h-4 w-4" />
                رجوع
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Preview Section */}
        <Card className="p-6">
          <h2 className="mb-6 text-xl font-bold">النتيجة</h2>
          <MarkdownDisplay title={title} content={content} loading={loading} />
        </Card>
      </div>
    </div>
  );
}

export default TestMarkdown;
