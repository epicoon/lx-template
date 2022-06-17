#lx:namespace lxsc;
class WidgetsReference extends lxsc.AbstractReference {
    getItemReference(item) {
        return new lxsc.WidgetReference(item);
    }
}
