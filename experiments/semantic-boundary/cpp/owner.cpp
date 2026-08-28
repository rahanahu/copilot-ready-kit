#include <memory>
#include <string>

struct Widget {
  explicit Widget(std::string value) : name(std::move(value)) {}
  std::string name;
};

void validate_widget(const Widget& widget);
void register_widget(std::unique_ptr<Widget> widget);

void publish_widget(const std::string& name) {
  Widget* widget = new Widget(name);
  validate_widget(*widget);
  register_widget(std::unique_ptr<Widget>(widget));
}
