#include <string>

struct WidgetView {
  const std::string& label() const;
};

void draw_label(const std::string& label);

void render_widget(const WidgetView* widget) {
  if (widget == nullptr) {
    return;
  }

  const WidgetView* current = widget;
  draw_label(current->label());
}
